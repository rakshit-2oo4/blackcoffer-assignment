import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import useDashboardData from "./hooks/useDashboardData.js";
import { useFilters } from "./context/FilterContext.jsx";
import Loader from "./components/Loader.jsx";

export default function App() {
    const { toQuery } = useFilters();
    const { filters, loading } = useDashboardData(toQuery());
    const [theme, setTheme] = useState("light");
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light");
    };

    return (
        <div className="app">
            <Sidebar options={filters} />
            <div className="main">
                <Topbar
                    theme={theme}
                    toggleTheme={toggleTheme}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                {loading && !filters ? (
                    <div className="content"><Loader /></div>
                ) : (
                    <Dashboard activeTab={activeTab} />
                )}
            </div>
        </div>
    );
}