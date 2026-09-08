import { useEffect, useState } from "react";
import { fetchAggregations, fetchFilterOptions, fetchRecords } from "../services/api";

export default function useDashboardData(query) {
    const [agg, setAgg] = useState(null);
    const [filters, setFilters] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const [a, f, r] = await Promise.all([
                    fetchAggregations(query),
                    fetchFilterOptions(),
                    fetchRecords({ ...query, limit: 500 })
                ]);
                if (!cancel) { setAgg(a); setFilters(f); setRecords(r); }
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [JSON.stringify(query)]);

    return { agg, filters, records, loading };
}