import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import DataRecord from "../models/DataRecord.js";
import { isMongoConnected } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let memoryRecords = null;

const deriveSWOT = (rec) => {
    const t = `${rec.title || ""} ${rec.insight || ""} ${rec.topic || ""}`.toLowerCase();
    if (/threat|risk|crisis|war|terror|decline|fall|drop|crash|volatil/.test(t)) return "Threat";
    if (/opportun|growth|rise|gain|recover|surge|expand|invest/.test(t)) return "Opportunity";
    if (/strength|dominat|lead|strong|robust|record/.test(t)) return "Strength";
    if (/weak|fragile|decline|loss|deficit|shortfall/.test(t)) return "Weakness";
    return "";
};

const getMemoryRecords = () => {
    if (memoryRecords) return memoryRecords;
    let filePath = path.join(__dirname, "..", "jsondata.json");
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, "..", "data", "jsondata.json");
    }
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const arr = JSON.parse(raw);
        memoryRecords = arr.map(r => ({ ...r, swot: r.swot || deriveSWOT(r) }));
    } else {
        memoryRecords = [];
    }
    return memoryRecords;
};

const parseArrayParam = (q, key) => {
    const val = q[key] || q[`${key}[]`];
    if (!val) return [];
    if (Array.isArray(val)) return val.map(v => String(v).trim());
    return [String(val).trim()];
};

const buildMongoQuery = (q) => {
    const f = {};
    const keys = ["end_year", "topic", "sector", "region", "pestle", "source", "swot", "country", "city"];
    keys.forEach(k => {
        const arr = parseArrayParam(q, k);
        if (arr.length) f[k] = { $in: arr };
    });
    const search = q.q || q.search;
    if (search) {
        f.$or = [
            { title: { $regex: search, $options: "i" } },
            { insight: { $regex: search, $options: "i" } },
            { topic: { $regex: search, $options: "i" } }
        ];
    }
    return f;
};

const filterMemoryRecords = (records, q) => {
    const keys = ["end_year", "topic", "sector", "region", "pestle", "source", "swot", "country", "city"];
    const filters = {};
    keys.forEach(k => {
        const arr = parseArrayParam(q, k);
        if (arr.length) filters[k] = arr;
    });
    const search = (q.q || q.search || "").toLowerCase();

    return records.filter(r => {
        for (const [k, vals] of Object.entries(filters)) {
            if (!vals.includes(String(r[k] || ""))) return false;
        }
        if (search) {
            const combined = `${r.title || ""} ${r.insight || ""} ${r.topic || ""}`.toLowerCase();
            if (!combined.includes(search)) return false;
        }
        return true;
    });
};

const avg = (arr, key) => {
    const valid = arr.map(x => Number(x[key])).filter(n => !isNaN(n) && n > 0);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
};

// GET /api/data/records
export const getRecords = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 2000;
        if (isMongoConnected) {
            const filter = buildMongoQuery(req.query);
            const records = await DataRecord.find(filter).limit(limit).lean();
            return res.json(records);
        }
        const filtered = filterMemoryRecords(getMemoryRecords(), req.query).slice(0, limit);
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/data/filters
export const getFilterOptions = async (_req, res) => {
    try {
        const fields = ["end_year", "topic", "sector", "region", "pestle", "source", "swot", "country", "city"];
        const result = {};
        if (isMongoConnected) {
            for (const field of fields) {
                const vals = await DataRecord.distinct(field);
                result[field] = vals.filter(v => v && String(v).trim() !== "").sort();
            }
            return res.json(result);
        }
        const records = getMemoryRecords();
        for (const field of fields) {
            const set = new Set();
            records.forEach(r => {
                const v = r[field];
                if (v && String(v).trim() !== "") set.add(String(v));
            });
            result[field] = Array.from(set).sort();
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/data/aggregations
export const getAggregations = async (req, res) => {
    try {
        if (isMongoConnected) {
            const match = buildMongoQuery(req.query);
            const byYear = await DataRecord.aggregate([
                { $match: { ...match, end_year: { $ne: "" } } },
                {
                    $group: {
                        _id: "$end_year", intensity: { $avg: "$intensity" },
                        likelihood: { $avg: "$likelihood" }, relevance: { $avg: "$relevance" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const bySector = await DataRecord.aggregate([
                { $match: { ...match, sector: { $ne: "" } } },
                {
                    $group: {
                        _id: "$sector", intensity: { $avg: "$intensity" },
                        likelihood: { $avg: "$likelihood" }, relevance: { $avg: "$relevance" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            const byRegion = await DataRecord.aggregate([
                { $match: { ...match, region: { $ne: "" } } },
                {
                    $group: {
                        _id: "$region", count: { $sum: 1 },
                        intensity: { $avg: "$intensity" },
                        relevance: { $avg: "$relevance" }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            const byTopic = await DataRecord.aggregate([
                { $match: { ...match, topic: { $ne: "" } } },
                {
                    $group: {
                        _id: "$topic", intensity: { $avg: "$intensity" },
                        relevance: { $avg: "$relevance" }, count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]);

            const byPestle = await DataRecord.aggregate([
                { $match: { ...match, pestle: { $ne: "" } } },
                {
                    $group: {
                        _id: "$pestle", intensity: { $avg: "$intensity" },
                        likelihood: { $avg: "$likelihood" },
                        relevance: { $avg: "$relevance" }, count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            const byCountry = await DataRecord.aggregate([
                { $match: { ...match, country: { $ne: "" } } },
                {
                    $group: {
                        _id: "$country", count: { $sum: 1 },
                        intensity: { $avg: "$intensity" },
                        relevance: { $avg: "$relevance" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 12 }
            ]);

            return res.json({ byYear, bySector, byRegion, byTopic, byPestle, byCountry });
        }

        // Fallback aggregation logic on in-memory records
        const records = filterMemoryRecords(getMemoryRecords(), req.query);

        const groupBy = (field, filterEmpty = true) => {
            const map = {};
            records.forEach(r => {
                const key = r[field];
                if (filterEmpty && (!key || String(key).trim() === "")) return;
                const k = String(key);
                if (!map[k]) map[k] = [];
                map[k].push(r);
            });
            return map;
        };

        const yearMap = groupBy("end_year");
        const byYear = Object.entries(yearMap)
            .map(([yr, items]) => ({
                _id: yr,
                intensity: avg(items, "intensity"),
                likelihood: avg(items, "likelihood"),
                relevance: avg(items, "relevance"),
                count: items.length
            }))
            .sort((a, b) => a._id.localeCompare(b._id));

        const sectorMap = groupBy("sector");
        const bySector = Object.entries(sectorMap)
            .map(([sec, items]) => ({
                _id: sec,
                intensity: avg(items, "intensity"),
                likelihood: avg(items, "likelihood"),
                relevance: avg(items, "relevance"),
                count: items.length
            }))
            .sort((a, b) => b.count - a.count);

        const regionMap = groupBy("region");
        const byRegion = Object.entries(regionMap)
            .map(([reg, items]) => ({
                _id: reg,
                intensity: avg(items, "intensity"),
                relevance: avg(items, "relevance"),
                count: items.length
            }))
            .sort((a, b) => b.count - a.count);

        const topicMap = groupBy("topic");
        const byTopic = Object.entries(topicMap)
            .map(([top, items]) => ({
                _id: top,
                intensity: avg(items, "intensity"),
                relevance: avg(items, "relevance"),
                count: items.length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);

        const pestleMap = groupBy("pestle");
        const byPestle = Object.entries(pestleMap)
            .map(([pest, items]) => ({
                _id: pest,
                intensity: avg(items, "intensity"),
                likelihood: avg(items, "likelihood"),
                relevance: avg(items, "relevance"),
                count: items.length
            }))
            .sort((a, b) => b.count - a.count);

        const countryMap = groupBy("country");
        const byCountry = Object.entries(countryMap)
            .map(([cnt, items]) => ({
                _id: cnt,
                intensity: avg(items, "intensity"),
                relevance: avg(items, "relevance"),
                count: items.length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 12);

        res.json({ byYear, bySector, byRegion, byTopic, byPestle, byCountry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};