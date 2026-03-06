import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import RAW_DATA from "../../../ges_data.js";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { UNI_COLORS } from "../../constants/theme.js";
import { fmt, fmtK } from "../../utils/formatters.js";
import SalaryBadge from "../common/SalaryBadge.jsx";
import CustomTooltip from "../common/CustomTooltip.jsx";

function ByCategoryTab() {
  const { cat_data, categories, years, unis } = RAW_DATA;
  const { isMobile, isTablet } = useBreakpoint();
  const [selCat, setSelCat] = useState("Computer Engineering");
  const [yearRange, setYearRange] = useState([2013, 2025]);
  const [activeUnis, setActiveUnis] = useState(new Set(unis));

  const minYear = years[0],
    maxYear = years[years.length - 1];

  const filteredYears = years.filter(
    (y) => y >= yearRange[0] && y <= yearRange[1],
  );

  const toggleUni = (u) =>
    setActiveUnis((prev) => {
      const next = new Set(prev);
      if (next.has(u)) {
        if (next.size > 1) next.delete(u);
      } else next.add(u);
      return next;
    });

  const chartData = filteredYears.map((yr) => {
    const row = { year: yr };
    unis.forEach((u) => {
      const d = (cat_data[selCat]?.[u] || []).find((r) => r.year === yr);
      row[u] = activeUnis.has(u) ? (d?.median_gross ?? null) : null;
    });
    return row;
  });

  const empData = filteredYears.map((yr) => {
    const row = { year: yr };
    unis.forEach((u) => {
      const d = (cat_data[selCat]?.[u] || []).find((r) => r.year === yr);
      row[u] = activeUnis.has(u) ? (d?.emp_overall ?? null) : null;
    });
    return row;
  });

  // Rankings for the selected end year
  const selEndYear = yearRange[1];
  const rank = unis
    .map((u) => {
      const d = (cat_data[selCat]?.[u] || []).find(
        (r) => r.year === selEndYear,
      );
      return d?.median_gross
        ? { uni: u, median_gross: d.median_gross, emp_overall: d.emp_overall }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.median_gross - a.median_gross);

  const availableUnis = Object.keys(cat_data[selCat] || {});

  // Data table: rows = unis, cols = filtered years
  const tableData = [...activeUnis]
    .filter((u) => availableUnis.includes(u))
    .map((u) => {
      const salaries = filteredYears.map((yr) => {
        const d = (cat_data[selCat]?.[u] || []).find((r) => r.year === yr);
        return { year: yr, median: d?.median_gross, emp: d?.emp_overall };
      });
      return { uni: u, salaries };
    });

  return (
    <div>
      {/* Category pills */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}
      >
        {categories
          .filter((c) => c !== "Other")
          .map((cat) => (
            <button
              key={cat}
              onClick={() => setSelCat(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1px solid ${selCat === cat ? "#00C9A7" : "#1e2130"}`,
                background: selCat === cat ? "#00C9A720" : "transparent",
                color: selCat === cat ? "#00C9A7" : "#555",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
      </div>

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <h3
          style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 700, margin: 0 }}
        >
          {selCat}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Year range */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: "#444",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              From
            </span>
            <select
              value={yearRange[0]}
              onChange={(e) =>
                setYearRange([
                  +e.target.value,
                  Math.max(+e.target.value, yearRange[1]),
                ])
              }
              style={{
                background: "#13151f",
                border: "1px solid #1e2130",
                color: "#aaa",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {years
                .filter((y) => y <= yearRange[1])
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
            <span
              style={{
                color: "#444",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              To
            </span>
            <select
              value={yearRange[1]}
              onChange={(e) =>
                setYearRange([
                  Math.min(yearRange[0], +e.target.value),
                  +e.target.value,
                ])
              }
              style={{
                background: "#13151f",
                border: "1px solid #1e2130",
                color: "#aaa",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {years
                .filter((y) => y >= yearRange[0])
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>

          {/* Uni toggles */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {availableUnis.map((u) => (
              <button
                key={u}
                onClick={() => toggleUni(u)}
                style={{
                  color: activeUnis.has(u) ? UNI_COLORS[u] : "#333",
                  background: activeUnis.has(u)
                    ? `${UNI_COLORS[u]}18`
                    : "#0d0f18",
                  border: `1px solid ${activeUnis.has(u) ? UNI_COLORS[u] + "44" : "#1a1d27"}`,
                  borderRadius: 6,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Salary chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1d27" />
          <XAxis dataKey="year" tick={{ fill: "#555", fontSize: 11 }} />
          <YAxis tickFormatter={fmtK} tick={{ fill: "#555", fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#555", fontSize: 12 }} />
          {unis.map(
            (u) =>
              activeUnis.has(u) && (
                <Line
                  key={u}
                  type="monotone"
                  dataKey={u}
                  stroke={UNI_COLORS[u]}
                  strokeWidth={u === "NTU" ? 3 : 1.8}
                  dot={{ r: u === "NTU" ? 5 : 3, fill: UNI_COLORS[u] }}
                  connectNulls
                />
              ),
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Rankings + Employment */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
          gap: 24,
          marginTop: 28,
        }}
      >
        <div>
          <h3
            style={{
              color: "#aaa",
              fontSize: 13,
              fontWeight: 500,
              margin: "0 0 12px 0",
            }}
          >
            Rankings — {selCat} ({selEndYear})
          </h3>
          {rank.length === 0 ? (
            <p style={{ color: "#444", fontSize: 13 }}>
              No data for {selEndYear}
            </p>
          ) : (
            rank
              .filter((d) => activeUnis.has(d.uni))
              .map((d, i) => (
                <div
                  key={d.uni}
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
                      fontWeight: 800,
                      width: 44,
                    }}
                  >
                    {d.uni}
                  </span>
                  <SalaryBadge
                    value={d.median_gross}
                    color={UNI_COLORS[d.uni]}
                  />
                  {d.emp_overall && (
                    <span style={{ color: "#555", fontSize: 11 }}>
                      {Number(d.emp_overall).toFixed(1)}% emp
                    </span>
                  )}
                </div>
              ))
          )}
        </div>
        <div>
          <h3
            style={{
              color: "#aaa",
              fontSize: 13,
              fontWeight: 500,
              margin: "0 0 12px 0",
            }}
          >
            Employment Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={empData}
              margin={{ top: 4, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d27" />
              <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 10 }} />
              <YAxis
                domain={[50, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "#444", fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={90} stroke="#ffffff10" strokeDasharray="4 4" />
              {unis.map(
                (u) =>
                  activeUnis.has(u) && (
                    <Line
                      key={u}
                      type="monotone"
                      dataKey={u}
                      stroke={UNI_COLORS[u]}
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                    />
                  ),
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data table */}
      {filteredYears.length <= 13 && tableData.length > 0 && (
        <div style={{ marginTop: 28, overflowX: "auto" }}>
          <h3
            style={{
              color: "#aaa",
              fontSize: 13,
              fontWeight: 500,
              margin: "0 0 12px 0",
            }}
          >
            Median Salary Table — {yearRange[0]}–{yearRange[1]}
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11,
              minWidth: 600,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1d27" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "6px 12px",
                    color: "#444",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    width: 60,
                  }}
                >
                  Uni
                </th>
                {filteredYears.map((y) => (
                  <th
                    key={y}
                    style={{
                      textAlign: "right",
                      padding: "6px 10px",
                      color: y === 2025 ? "#00C9A7" : "#444",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    {y}
                    {y === 2025 ? "★" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map(({ uni, salaries }, i) => (
                <tr
                  key={uni}
                  style={{
                    borderBottom: "1px solid #0f111a",
                    background: i % 2 === 0 ? "#0b0d14" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "7px 12px",
                      color: UNI_COLORS[uni],
                      fontWeight: 800,
                    }}
                  >
                    {uni}
                  </td>
                  {salaries.map(({ year, median }) => (
                    <td
                      key={year}
                      style={{
                        padding: "7px 10px",
                        textAlign: "right",
                        color: median ? UNI_COLORS[uni] : "#222",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 11,
                        fontWeight: year === 2025 ? 700 : 400,
                      }}
                    >
                      {median
                        ? `$${Math.round(median / 100) * 100 === median ? median.toLocaleString() : Math.round(median).toLocaleString()}`
                        : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ByCategoryTab;
