export const fmt = (n, d = 1) =>
    n == null || isNaN(n) ? "—" : Number(n).toFixed(d);

export const sum = (arr, key) => arr.reduce((a, b) => a + (b[key] || 0), 0);

export const avg = (arr, key) =>
    arr.length ? sum(arr, key) / arr.length : 0;

export const truncate = (str, len = 12) => {
    if (!str) return "";
    const s = String(str).trim();
    return s.length > len ? s.slice(0, len) + "…" : s;
};

// Executive BI Color Palette
export const palette = [
    "#4f46e5", // Indigo
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#3b82f6", // Blue
    "#ec4899", // Pink
    "#f97316", // Orange
    "#0d9488", // Teal
    "#6366f1"  // Bright Indigo
];

export const metricColors = {
    intensity: "#4f46e5",
    likelihood: "#10b981",
    relevance: "#f59e0b"
};