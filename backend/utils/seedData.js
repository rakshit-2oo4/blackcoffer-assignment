import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import DataRecord from "../models/DataRecord.js";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const deriveSWOT = (rec) => {
    const t = `${rec.title || ""} ${rec.insight || ""} ${rec.topic || ""}`.toLowerCase();
    if (/threat|risk|crisis|war|terror|decline|fall|drop|crash|volatil/.test(t)) return "Threat";
    if (/opportun|growth|rise|gain|recover|surge|expand|invest/.test(t)) return "Opportunity";
    if (/strength|dominat|lead|strong|robust|record/.test(t)) return "Strength";
    if (/weak|fragile|decline|loss|deficit|shortfall/.test(t)) return "Weakness";
    return "";
};

export const seedDatabase = async () => {
    let filePath = path.join(__dirname, "..", "jsondata.json");
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, "..", "data", "jsondata.json");
    }
    if (!fs.existsSync(filePath)) {
        console.error("❌ Could not find jsondata.json at:", filePath);
        return;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const arr = JSON.parse(raw);

    const docs = arr.map((r) => ({ ...r, swot: r.swot || deriveSWOT(r) }));

    await DataRecord.deleteMany({});
    await DataRecord.insertMany(docs, { ordered: false });
    console.log(`✅ Seeded ${docs.length} records into database`);
};

if (process.argv[1] && process.argv[1].endsWith("seedData.js")) {
    connectDB().then(async () => {
        await seedDatabase();
        process.exit(0);
    }).catch((e) => { console.error(e); process.exit(1); });
}