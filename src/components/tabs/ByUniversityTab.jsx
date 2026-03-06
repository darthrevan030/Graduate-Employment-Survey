import { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import RAW_DATA from "../../../ges_data.js";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { UNI_COLORS } from "../../constants/theme.js";
import { fmt, fmtK } from "../../utils/formatters.js";
import CustomTooltip from "../common/CustomTooltip.jsx";

function ByUniversityTab() {
  const { uni_degrees, unis } = RAW_DATA;
  const { isMobile, isTablet } = useBreakpoint();
  const [selUni, setSelUni] = useState("NTU");
  const [search, setSearch] = useState("");
  const [selDeg, setSelDeg] = useState(null);
  const [showList, setShowList] = useState(true);

  const degrees = Object.keys(uni_degrees[selUni] || {});
  const filtered = degrees.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase()),
  );

  const degWithSalary = filtered
    .map((d) => {
      const rows = uni_degrees[selUni][d];
      const latest = [...rows].reverse().find((r) => r.median_gross);
      return { deg: d, latest, rows };
    })
    .filter((r) => r.latest)
    .sort((a, b) => b.latest.median_gross - a.latest.median_gross);

  const selected = selDeg && uni_degrees[selUni][selDeg];
  const chartData = selected
    ? selected.map((r) => ({
        year: r.year,
        Median: r.median_gross,
        P25: r.p25,
        P75: r.p75,
      }))
    : [];

  return (
    <div>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {unis.map((u) => (
          <button
            key={u}
            onClick={() => {
              setSelUni(u);
              setSelDeg(null);
              setSearch("");
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: selUni === u ? UNI_COLORS[u] : "#13151f",
              color: selUni === u ? "#000" : "#666",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {u}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "300px 1fr",
          gap: 20,
          minHeight: isTablet ? "auto" : 520,
        }}
      >
        <div style={{ display: isTablet && !showList ? "none" : "block" }}>
          <input
            placeholder="Search degrees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "#13151f",
              border: "1px solid #1e2130",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#e0e0e0",
              fontSize: 12,
              outline: "none",
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
          <div style={{ overflowY: "auto", maxHeight: isTablet ? 300 : 540 }}>
            {degWithSalary.map(({ deg, latest }) => (
              <div
                key={deg}
                onClick={() => {
                  setSelDeg(deg);
                  if (isTablet) setShowList(false);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 4,
                  cursor: "pointer",
                  background:
                    selDeg === deg ? `${UNI_COLORS[selUni]}18` : "#0d0f18",
                  border: `1px solid ${selDeg === deg ? UNI_COLORS[selUni] + "44" : "#0d0f18"}`,
                  transition: "all 0.1s",
                }}
              >
                <div
                  style={{
                    color: selDeg === deg ? UNI_COLORS[selUni] : "#bbb",
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {deg}
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      color: UNI_COLORS[selUni],
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {fmt(latest.median_gross)}
                  </span>
                  <span style={{ color: "#444", fontSize: 10 }}>
                    {latest.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: isTablet && showList ? "none" : "block" }}>
          {isTablet && selDeg && (
            <button
              onClick={() => setShowList(true)}
              style={{
                background: "#13151f",
                border: "1px solid #1e2130",
                color: "#888",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12,
                cursor: "pointer",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to list
            </button>
          )}
          {!selDeg ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 400,
                color: "#333",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>👆</div>
              <div style={{ fontSize: 14 }}>Select a degree to see trends</div>
            </div>
          ) : (
            <div>
              <h3
                style={{
                  color: "#e0e0e0",
                  fontSize: 15,
                  fontWeight: 700,
                  margin: "0 0 4px 0",
                }}
              >
                {selDeg}
              </h3>
              <div
                style={{
                  color: UNI_COLORS[selUni],
                  fontSize: 12,
                  marginBottom: 20,
                }}
              >
                {selUni}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 24,
                  flexWrap: "wrap",
                }}
              >
                {(() => {
                  const rows = uni_degrees[selUni][selDeg].filter(
                    (r) => r.median_gross,
                  );
                  const latest = rows[rows.length - 1];
                  const first = rows[0];
                  const growth =
                    first && first.median_gross
                      ? (
                          ((latest.median_gross - first.median_gross) /
                            first.median_gross) *
                          100
                        ).toFixed(0)
                      : null;
                  return (
                    <>
                      <div
                        style={{
                          background: "#13151f",
                          borderRadius: 10,
                          padding: "14px 18px",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            color: "#555",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Latest Median
                        </div>
                        <div
                          style={{
                            color: UNI_COLORS[selUni],
                            fontSize: 22,
                            fontWeight: 800,
                            fontFamily: "'Space Mono', monospace",
                          }}
                        >
                          {fmt(latest?.median_gross)}
                        </div>
                        <div style={{ color: "#444", fontSize: 10 }}>
                          {latest?.year}
                        </div>
                      </div>
                      {latest?.p25 && (
                        <div
                          style={{
                            background: "#13151f",
                            borderRadius: 10,
                            padding: "14px 18px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              color: "#555",
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            25th–75th %ile
                          </div>
                          <div
                            style={{
                              color: "#888",
                              fontSize: 16,
                              fontWeight: 700,
                              fontFamily: "'Space Mono', monospace",
                            }}
                          >
                            {fmt(latest.p25)} – {fmt(latest.p75)}
                          </div>
                        </div>
                      )}
                      {growth && (
                        <div
                          style={{
                            background: "#13151f",
                            borderRadius: 10,
                            padding: "14px 18px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              color: "#555",
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            Growth ({first.year}→{latest.year})
                          </div>
                          <div
                            style={{
                              color: "#00C9A7",
                              fontSize: 22,
                              fontWeight: 800,
                              fontFamily: "'Space Mono', monospace",
                            }}
                          >
                            +{growth}%
                          </div>
                        </div>
                      )}
                      {latest?.emp_overall && (
                        <div
                          style={{
                            background: "#13151f",
                            borderRadius: 10,
                            padding: "14px 18px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              color: "#555",
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            Emp. Rate
                          </div>
                          <div
                            style={{
                              color: "#4A90E2",
                              fontSize: 22,
                              fontWeight: 800,
                              fontFamily: "'Space Mono', monospace",
                            }}
                          >
                            {Number(latest.emp_overall).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <h4
                style={{
                  color: "#666",
                  fontSize: 12,
                  fontWeight: 500,
                  margin: "0 0 12px 0",
                }}
              >
                Salary Trend
              </h4>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={UNI_COLORS[selUni]}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={UNI_COLORS[selUni]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1d27" />
                  <XAxis dataKey="year" tick={{ fill: "#555", fontSize: 11 }} />
                  <YAxis
                    tickFormatter={fmtK}
                    tick={{ fill: "#555", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Median"
                    stroke={UNI_COLORS[selUni]}
                    strokeWidth={2.5}
                    fill="url(#medGrad)"
                    dot={{ r: 4, fill: UNI_COLORS[selUni] }}
                    connectNulls
                  />
                  {chartData.some((r) => r.P25) && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="P25"
                        stroke={UNI_COLORS[selUni]}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        connectNulls
                        opacity={0.4}
                      />
                      <Line
                        type="monotone"
                        dataKey="P75"
                        stroke={UNI_COLORS[selUni]}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        connectNulls
                        opacity={0.4}
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>

              <div style={{ marginTop: 20, overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1d27" }}>
                      {["Year", "Median", "25th", "75th", "Emp Rate"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "6px 10px",
                              color: "#444",
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: 0.8,
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {uni_degrees[selUni][selDeg]
                      .slice()
                      .reverse()
                      .map((r, i) => (
                        <tr
                          key={r.year}
                          style={{
                            borderBottom: "1px solid #0f111a",
                            background: i % 2 === 0 ? "#0b0d14" : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "6px 10px",
                              color: r.year === 2025 ? "#00C9A7" : "#666",
                              fontFamily: "'Space Mono', monospace",
                              fontWeight: r.year === 2025 ? 700 : 400,
                            }}
                          >
                            {r.year}
                            {r.year === 2025 ? " ★" : ""}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              color: UNI_COLORS[selUni],
                              fontWeight: 700,
                            }}
                          >
                            {fmt(r.median_gross)}
                          </td>
                          <td style={{ padding: "6px 10px", color: "#555" }}>
                            {fmt(r.p25)}
                          </td>
                          <td style={{ padding: "6px 10px", color: "#555" }}>
                            {fmt(r.p75)}
                          </td>
                          <td style={{ padding: "6px 10px", color: "#4A90E2" }}>
                            {r.emp_overall
                              ? `${Number(r.emp_overall).toFixed(1)}%`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ByUniversityTab;
