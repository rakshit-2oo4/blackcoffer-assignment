import { createContext, useContext, useState, useCallback } from "react";

const FilterContext = createContext(null);
export const useFilters = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
    const [filters, setFilters] = useState({
        end_year: [], topic: [], sector: [], region: [],
        pestle: [], source: [], swot: [], country: [], city: []
    });
    const [search, setSearch] = useState("");

    const setFilter = (key, values) =>
        setFilters((p) => ({ ...p, [key]: values }));

    const reset = () => {
        setFilters({
            end_year: [], topic: [], sector: [], region: [],
            pestle: [], source: [], swot: [], country: [], city: []
        });
        setSearch("");
    };

    const toQuery = useCallback(() => {
        const q = {};
        Object.entries(filters).forEach(([k, v]) => {
            if (Array.isArray(v) && v.length) q[k] = v;
        });
        if (search) q.q = search;
        return q;
    }, [filters, search]);

    const activeCount = Object.values(filters).reduce((a, b) => a + (b?.length || 0), 0);

    return (
        <FilterContext.Provider
            value={{ filters, setFilter, reset, search, setSearch, toQuery, activeCount }}
        >
            {children}
        </FilterContext.Provider>
    );
};