import { fmt } from "../../utils/formatters";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#0d0f18",
        border: "1px solid #252836",
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 13,
        minWidth: 160,
      }}
    >
      <div
        style={{
          color: "#666",
          marginBottom: 6,
          fontWeight: 700,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {label}
      </div>
      {payload.map(
        (p, i) =>
          p.value != null && (
            <div key={i} style={{ color: p.color, marginBottom: 3 }}>
              <span style={{ fontWeight: 700 }}>{p.name}:</span>{" "}
              {p.name?.toLowerCase().includes("rate") ||
              p.name?.toLowerCase().includes("emp")
                ? `${Number(p.value).toFixed(1)}%`
                : fmt(p.value)}
            </div>
          ),
      )}
    </div>
  );
};

export default CustomTooltip;
