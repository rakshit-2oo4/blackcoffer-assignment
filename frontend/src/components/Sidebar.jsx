import FilterPanel from "./FilterPanel.jsx";
import { useFilters } from "../context/FilterContext.jsx";
import { ZapIcon, CalendarIcon, GlobeIcon } from "./Icons.jsx";

export default function Sidebar({ options }) {
    const { setFilter, reset } = useFilters();

    const applyPreset = (preset) => {
        reset();
        if (preset === "energy") {
            setFilter("sector", ["Energy"]);
        } else if (preset === "future") {
            setFilter("end_year", ["2025", "2030", "2040", "2050"]);
        } else if (preset === "us_china") {
            setFilter("country", ["United States of America", "China", "India"]);
        }
    };

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-icon">
                    <ZapIcon size={20} color="white" />
                </div>
                <div>
                    Insight<span style={{ color: "var(--accent)" }}>Pulse</span>
                </div>
            </div>

            <div className="section-title">Quick Presets</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button className="chip" style={{ cursor: "pointer" }} onClick={() => applyPreset("energy")}>
                    <ZapIcon size={13} color="var(--accent)" /> Energy Sector
                </button>
                <button className="chip" style={{ cursor: "pointer" }} onClick={() => applyPreset("future")}>
                    <CalendarIcon size={13} color="var(--accent)" /> Future 2025+
                </button>
                <button className="chip" style={{ cursor: "pointer" }} onClick={() => applyPreset("us_china")}>
                    <GlobeIcon size={13} color="var(--accent)" /> Top Markets
                </button>
            </div>

            <FilterPanel options={options} />
        </aside>
    );
}