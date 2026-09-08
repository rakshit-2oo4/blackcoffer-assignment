import { useMemo, useState } from "react";
import { useFilters } from "../context/FilterContext.jsx";
import useDashboardData from "../hooks/useDashboardData.js";
import StatCard from "../components/StatCard.jsx";
import Loader from "../components/Loader.jsx";
import BarChartD3 from "../charts/BarChartD3.jsx";
import LineChartD3 from "../charts/LineChartD3.jsx";
import DonutChartD3 from "../charts/DonutChartD3.jsx";
import BubbleChartD3 from "../charts/BubbleChartD3.jsx";
import RadarChartD3 from "../charts/RadarChartD3.jsx";
import HeatmapD3 from "../charts/HeatmapD3.jsx";
import TreemapD3 from "../charts/TreemapD3.jsx";
import { fmt, avg } from "../utils/helpers.js";
import {
    BarChartIcon,
    TrendingUpIcon,
    TargetIcon,
    StarIcon,
    ExternalLinkIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "../components/Icons.jsx";

export default function Dashboard({ activeTab = "overview" }) {
    const { toQuery } = useFilters();
    const { agg, records, loading } = useDashboardData(toQuery());
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const totals = useMemo(() => ({
        records: records.length,
        avgIntensity: avg(records, "intensity"),
        avgLikelihood: avg(records, "likelihood"),
        avgRelevance: avg(records, "relevance")
    }), [records]);

    // Build heatmap matrix: regions × sectors (avg intensity)
    const { rows, cols, matrix } = useMemo(() => {
        if (!agg) return { rows: [], cols: [], matrix: [] };
        const sectors = agg.bySector.slice(0, 6).map(d => d._id);
        const regions = agg.byRegion.slice(0, 6).map(d => d._id);
        const mat = regions.map(r => sectors.map(s => {
            const cell = records.filter(x => x.region === r && x.sector === s);
            return cell.length ? avg(cell, "intensity") : 0;
        }));
        return { rows: regions, cols: sectors, matrix: mat };
    }, [agg, records]);

    const paginatedRecords = useMemo(() => {
        const start = (page - 1) * pageSize;
        return records.slice(start, start + pageSize);
    }, [records, page]);

    const totalPages = Math.ceil(records.length / pageSize) || 1;

    if (loading || !agg) return <div className="content"><Loader /></div>;

    return (
        <div className="content">
            {/* Top Key Metrics */}
            <div className="grid cards-4">
                <StatCard
                    title="Total Insights"
                    value={totals.records.toLocaleString()}
                    sub="Filtered dataset records"
                    color="var(--accent-2)"
                    Icon={BarChartIcon}
                />
                <StatCard
                    title="Avg Intensity"
                    value={fmt(totals.avgIntensity)}
                    sub="Impact & scope measure"
                    color="var(--accent)"
                    Icon={TrendingUpIcon}
                />
                <StatCard
                    title="Avg Likelihood"
                    value={fmt(totals.avgLikelihood)}
                    sub="Probability index (0-5)"
                    color="var(--success)"
                    Icon={TargetIcon}
                />
                <StatCard
                    title="Avg Relevance"
                    value={fmt(totals.avgRelevance)}
                    sub="Strategic weight (0-5)"
                    color="var(--warning)"
                    Icon={StarIcon}
                />
            </div>

            {/* Overview View */}
            {activeTab === "overview" && (
                <>
                    <div className="grid cards-2" style={{ marginTop: 20 }}>
                        <LineChartD3
                            data={agg.byYear.map(d => ({
                                year: d._id,
                                intensity: d.intensity,
                                likelihood: d.likelihood,
                                relevance: d.relevance
                            }))}
                            xKey="year"
                            metrics={["intensity", "likelihood", "relevance"]}
                            title="Timeline Trends by End Year (Avg Intensity / Likelihood / Relevance)"
                        />
                        <BarChartD3
                            data={agg.bySector.slice(0, 8).map(d => ({ name: d._id, value: d.count }))}
                            xKey="name"
                            yKey="value"
                            title="Records Volume by Sector"
                        />
                    </div>

                    <div className="grid cards-3" style={{ marginTop: 20 }}>
                        <DonutChartD3
                            data={agg.byPestle.map(d => ({ name: d._id, value: d.count }))}
                            keyField="name"
                            valueField="value"
                            title="PEST Framework Distribution"
                        />
                        <BubbleChartD3
                            data={agg.byTopic.slice(0, 12).map(d => ({ name: d._id, value: d.count }))}
                            keyField="name"
                            sizeField="value"
                            title="Top Topics (Bubble size = volume)"
                        />
                        <TreemapD3
                            data={agg.byRegion.slice(0, 12).map(d => ({ name: d._id, value: d.count }))}
                            keyField="name"
                            valueField="value"
                            title="Geographic Region Share (Treemap)"
                        />
                    </div>

                    <div className="grid cards-2" style={{ marginTop: 20 }}>
                        <BarChartD3
                            data={agg.byCountry.slice(0, 10).map(d => ({ name: d._id, value: d.intensity }))}
                            xKey="name"
                            yKey="value"
                            title="Top Countries by Avg Intensity"
                        />
                        <RadarChartD3
                            data={agg.bySector.slice(0, 8).map(d => ({
                                key: d._id,
                                intensity: d.intensity
                            }))}
                            axes={agg.bySector.slice(0, 8).map(d => d._id)}
                            valueField="intensity"
                            title="Sector Intensity Profile (Radar)"
                        />
                    </div>
                </>
            )}

            {/* Analytics View */}
            {activeTab === "matrix" && (
                <>
                    <div className="grid cards-2" style={{ marginTop: 20 }}>
                        <HeatmapD3
                            rows={rows}
                            cols={cols}
                            matrix={matrix}
                            title="Region × Sector Intensity Heatmap Matrix"
                        />
                        <RadarChartD3
                            data={agg.bySector.slice(0, 8).map(d => ({
                                key: d._id,
                                intensity: d.intensity
                            }))}
                            axes={agg.bySector.slice(0, 8).map(d => d._id)}
                            valueField="intensity"
                            title="Sector Intensity Radar"
                        />
                    </div>

                    <div className="grid cards-2" style={{ marginTop: 20 }}>
                        <BubbleChartD3
                            data={agg.byTopic.slice(0, 15).map(d => ({ name: d._id, value: d.count }))}
                            keyField="name"
                            sizeField="value"
                            title="Topic Cluster Analysis"
                        />
                        <DonutChartD3
                            data={agg.bySector.slice(0, 6).map(d => ({ name: d._id, value: d.count }))}
                            keyField="name"
                            valueField="value"
                            title="Sector Market Share"
                        />
                    </div>
                </>
            )}

            {/* Data Table View */}
            {activeTab === "table" && (
                <div style={{ marginTop: 20 }}>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title / Insight</th>
                                    <th>Topic</th>
                                    <th>Sector</th>
                                    <th>Region / Country</th>
                                    <th>Intensity</th>
                                    <th>Likelihood</th>
                                    <th>Relevance</th>
                                    <th>SWOT</th>
                                    <th>Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRecords.map((r, i) => (
                                    <tr key={r._id || i}>
                                        <td style={{ maxWidth: 320, fontWeight: 600 }}>
                                            {r.title || r.insight || "—"}
                                        </td>
                                        <td>
                                            <span className="chip" style={{ fontSize: 11 }}>{r.topic || "—"}</span>
                                        </td>
                                        <td>{r.sector || "—"}</td>
                                        <td>{r.country || r.region || "—"}</td>
                                        <td style={{ fontWeight: 700, color: "var(--accent)" }}>{r.intensity || 0}</td>
                                        <td>{r.likelihood || 0}</td>
                                        <td>{r.relevance || 0}</td>
                                        <td>
                                            {r.swot ? (
                                                <span className={`badge ${r.swot.toLowerCase()}`}>{r.swot}</span>
                                            ) : "—"}
                                        </td>
                                        <td>
                                            {r.url ? (
                                                <a href={r.url} target="_blank" rel="noreferrer" className="table-link" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                    Link <ExternalLinkIcon size={12} />
                                                </a>
                                            ) : (r.source || "—")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                            Page {page} of {totalPages} ({records.length} total records)
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                className="btn ghost"
                                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeftIcon size={14} /> Previous
                            </button>
                            <button
                                className="btn ghost"
                                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                            >
                                Next <ChevronRightIcon size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}