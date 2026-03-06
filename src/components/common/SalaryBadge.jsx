import { fmt } from "../../utils/formatters";

const SalaryBadge = ({ value, color }) => (
  <span
    style={{
      background: `${color}22`,
      border: `1px solid ${color}44`,
      color,
      borderRadius: 6,
      padding: "2px 10px",
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "'Space Mono', monospace",
    }}
  >
    {fmt(value)}
  </span>
);

export default SalaryBadge;
