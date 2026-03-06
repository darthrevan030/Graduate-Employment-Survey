export const fmt = (v) => (v ? `$${Math.round(v).toLocaleString()}` : "—");
export const fmtK = (v) => (v ? `$${(v / 1000).toFixed(1)}k` : "—");
