import axios from "axios";

const api = axios.create({ baseURL: "/api/data" });

export const fetchRecords = (params) => api.get("/records", { params }).then(r => r.data);
export const fetchFilterOptions = () => api.get("/filters").then(r => r.data);
export const fetchAggregations = (params) => api.get("/aggregations", { params }).then(r => r.data);