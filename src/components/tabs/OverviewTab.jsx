import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import RAW_DATA from "../../../ges_data.js";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { UNI_COLORS } from "../../constants/theme.js";
import { fmt, fmtK } from "../../utils/formatters.js";
import SalaryBadge from "../common/SalaryBadge.jsx";
import CustomTooltip from "../common/CustomTooltip.jsx";

function OverviewTab() {
  const { overall_data, unis, years, rankings_2025, categories } = RAW_DATA;
  const { isMobile, isTablet } = useBreakpoint();

  const chartData = years.map((yr) => {
    const row = { year: yr };
    unis.forEach((u) => {
      const d = overall_data[u]?.find((r) => r.year === yr);
      row[u] = d?.gross_monthly_median ?? null;
    });
    return row;
  });

  const rank2025 = unis
    .map((u) => {
      const d = overall_data[u]?.find((r) => r.year === 2025);
      return { uni: u, val: d?.gross_monthly_median };
    })
    .filter((r) => r.val)
    .sort((a, b) => b.val - a.val);

  const topCats = categories
    .map((cat) => {
      const rows = rankings_2025[cat] || [];
      const best = rows[0];
      return best ? { cat, uni: best.uni, val: best.median_gross } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.val - a.val)
    .slice(0, 12);

  return (
    <div>
      <h3
        style={{
          color: "#aaa",
          fontSize: 14,
          fontWeight: 500,
          margin: "0 0 16px 0",
        }}
      >
        Median Gross Monthly Salary — All Universities (2013–2025)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1d27" />
          <XAxis dataKey="year" tick={{ fill: "#555", fontSize: 11 }} />
          <YAxis
            tickFormatter={fmtK}
            tick={{ fill: "#555", fontSize: 11 }}
            domain={[2500, 5800]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#555", fontSize: 12 }} />
          {unis.map((u) => (
            <Line
              key={u}
              type="monotone"
              dataKey={u}
              stroke={UNI_COLORS[u]}
              strokeWidth={u === "NTU" ? 3 : 1.8}
              dot={{ r: u === "NTU" ? 5 : 2.5, fill: UNI_COLORS[u] }}
              connectNulls
              opacity={u === "NTU" ? 1 : 0.8}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
          gap: 24,
          marginTop: 32,
        }}
      >
        <div>
          <h3
            style={{
              color: "#aaa",
              fontSize: 14,
              fontWeight: 500,
              margin: "0 0 14px 0",
            }}
          >
            2025 University Rankings
          </h3>
          {rank2025.map((d, i) => (
            <div
              key={d.uni}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 9,
              }}
            >
              <span
                style={{
                  color: "#333",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  width: 18,
                }}
              >
                #{i + 1}
              </span>
              <span
                style={{ color: UNI_COLORS[d.uni], fontWeight: 800, width: 48 }}
              >
                {d.uni}
              </span>
              <div
                style={{
                  flex: 1,
                  background: "#13151f",
                  borderRadius: 4,
                  height: 26,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(d.val / 6000) * 100}%`,
                    height: "100%",
                    background: `${UNI_COLORS[d.uni]}25`,
                    borderRight: `3px solid ${UNI_COLORS[d.uni]}`,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 8,
                    color: UNI_COLORS[d.uni],
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {fmt(d.val)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3
            style={{
              color: "#aaa",
              fontSize: 14,
              fontWeight: 500,
              margin: "0 0 14px 0",
            }}
          >
            Top Paying Fields 2025 (Best Uni)
          </h3>
          {topCats.map((d, i) => (
            <div
              key={d.cat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  color: "#333",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  width: 18,
                }}
              >
                #{i + 1}
              </span>
              <span
                style={{
                  color: UNI_COLORS[d.uni],
                  fontSize: 11,
                  fontWeight: 700,
                  width: 36,
                }}
              >
                {d.uni}
              </span>
              <span
                style={{
                  color: "#888",
                  fontSize: 12,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {d.cat}
              </span>
              <SalaryBadge value={d.val} color={UNI_COLORS[d.uni]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
