const TabBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 14px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      transition: "all 0.15s",
      whiteSpace: "nowrap",
      background: active ? "#00C9A7" : "#13151f",
      color: active ? "#000" : "#666",
      flexShrink: 0,
    }}
  >
    {label}
  </button>
);

export default TabBtn;
