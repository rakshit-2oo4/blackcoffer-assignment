import { useFilters } from "../context/FilterContext.jsx";
import {
    SearchIcon,
    SunIcon,
    MoonIcon,
    BarChartIcon,
    GridIcon,
    TableIcon
} from "./Icons.jsx";

export default function Topbar({ theme, toggleTheme, activeTab, setActiveTab }) {
    const { search, setSearch } = useFilters();

    return (
        <header className="topbar">
            <div className="search-wrap">
                <SearchIcon className="search-icon" size={16} />
                <input
                    className="search"
                    placeholder="Search insights, titles, topics, countries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="topbar-actions">
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <BarChartIcon size={14} /> Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "matrix" ? "active" : ""}`}
                        onClick={() => setActiveTab("matrix")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <GridIcon size={14} /> Analytics
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "table" ? "active" : ""}`}
                        onClick={() => setActiveTab("table")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <TableIcon size={14} /> Data Table
                    </button>
                </div>

                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title="Toggle Light / Dark Mode"
                >
                    {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
                </button>
            </div>
        </header>
    );
}