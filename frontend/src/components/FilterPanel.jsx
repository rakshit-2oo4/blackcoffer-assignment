import { useFilters } from "../context/FilterContext.jsx";
import {
    CalendarIcon,
    LightbulbIcon,
    BuildingIcon,
    GlobeIcon,
    LayersIcon,
    NewspaperIcon,
    ShieldIcon,
    FlagIcon,
    RotateCcwIcon
} from "./Icons.jsx";

const FIELDS = [
    { key: "end_year", label: "End Year", Icon: CalendarIcon },
    { key: "topic", label: "Topics", Icon: LightbulbIcon },
    { key: "sector", label: "Sectors", Icon: BuildingIcon },
    { key: "region", label: "Regions", Icon: GlobeIcon },
    { key: "pestle", label: "PEST", Icon: LayersIcon },
    { key: "source", label: "Sources", Icon: NewspaperIcon },
    { key: "swot", label: "SWOT", Icon: ShieldIcon },
    { key: "country", label: "Countries", Icon: FlagIcon }
];

export default function FilterPanel({ options }) {
    const { filters, setFilter, reset, activeCount } = useFilters();

    return (
        <div style={{ marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="section-title" style={{ margin: 0 }}>Filters</span>
                    {activeCount > 0 && (
                        <span className="chip" style={{ fontSize: "10px", padding: "2px 8px" }}>
                            {activeCount} selected
                        </span>
                    )}
                </div>
                <button
                    className="btn ghost"
                    style={{ padding: "4px 10px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    onClick={reset}
                    disabled={activeCount === 0}
                >
                    <RotateCcwIcon size={12} /> Clear All
                </button>
            </div>

            {FIELDS.map(({ key, label, Icon }) => {
                const list = options?.[key] || [];
                const currentVals = filters[key] || [];
                return (
                    <div className="filter-group" key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Icon size={14} color="var(--text-muted)" />
                                <span>{label}</span>
                            </label>
                            {currentVals.length > 0 && (
                                <span style={{ fontSize: "10px", color: "var(--accent)", fontWeight: "700" }}>
                                    {currentVals.length}
                                </span>
                            )}
                        </div>
                        <select
                            multiple
                            size={Math.min(Math.max(list.length, 3), 4)}
                            className="multiselect"
                            value={currentVals}
                            onChange={(e) =>
                                setFilter(key, Array.from(e.target.selectedOptions).map(o => o.value))
                            }
                        >
                            {list.map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}
        </div>
    );
}