import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
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
import CustomTooltip from "../common/CustomTooltip.jsx";

function CompareTab() {
  const { cat_data, categories, unis, years } = RAW_DATA;
  const { isMobile, isTablet } = useBreakpoint();
  const [view, setView] = useState("salary");
  const [yr, setYr] = useState(2025);
  const [activeUnis, setActiveUnis] = useState(new Set(unis));

  const cats = categories.filter((c) => c !== "Other");
  const shortCat = (c) =>
    c
      .replace(" Engineering", "Eng")
      .replace("Information Systems/Tech", "Info Sys/Tech")
      .replace("Social Sciences/Comms", "Social Sci")
      .replace("Sciences/Math", "Sci/Math")
      .replace("Architecture/Design", "Arch/Design")
      .replace("Data Science/Analytics", "Data Sci");

  const toggleUni = (u) =>
    setActiveUnis((prev) => {
      const n = new Set(prev);
      if (n.has(u)) {
        if (n.size > 1) n.delete(u);
      } else n.add(u);
      return n;
    });

  // ── Salary bar data
  const salaryBar = cats
    .map((cat) => {
      const row = { cat: shortCat(cat), fullCat: cat };
      unis.forEach((u) => {
        if (!activeUnis.has(u)) return;
        const d = (cat_data[cat]?.[u] || []).find((r) => r.year === yr);
        row[u] = d?.median_gross ?? null;
      });
      return row;
    })
    .sort(
      (a, b) =>
        Math.max(...unis.map((u) => b[u] || 0)) -
        Math.max(...unis.map((u) => a[u] || 0)),
    );

  // ── Growth data: salary growth % from earliest available to 2025
  const growthData = useMemo(
    () =>
      cats
        .map((cat) => {
          const row = { cat: shortCat(cat), fullCat: cat };
          unis.forEach((u) => {
            const entries = (cat_data[cat]?.[u] || [])
              .filter((r) => r.median_gross)
              .sort((a, b) => a.year - b.year);
            if (entries.length < 2) return;
            const first = entries[0],
              last = entries[entries.length - 1];
            row[u] = parseFloat(
              (
                ((last.median_gross - first.median_gross) /
                  first.median_gross) *
                100
              ).toFixed(1),
            );
            row[`${u}_from`] = first.year;
            row[`${u}_to`] = last.year;
          });
          return row;
        })
        .sort(
          (a, b) =>
            Math.max(...unis.map((u) => b[u] || 0)) -
            Math.max(...unis.map((u) => a[u] || 0)),
        ),
    [],
  );

  // ── Employment rate data
  const empBar = cats
    .map((cat) => {
      const row = { cat: shortCat(cat), fullCat: cat };
      unis.forEach((u) => {
        if (!activeUnis.has(u)) return;
        const d = (cat_data[cat]?.[u] || []).find((r) => r.year === yr);
        row[u] = d?.emp_overall
          ? parseFloat(Number(d.emp_overall).toFixed(1))
          : null;
      });
      return row;
    })
    .sort(
      (a, b) =>
        Math.max(...unis.map((u) => b[u] || 0)) -
        Math.max(...unis.map((u) => a[u] || 0)),
    );

  // ── Scout: find best field per priority for a uni
  const [scoutUni, setScoutUni] = useState("NTU");
  const [scoutPriority, setScoutPriority] = useState("salary");
  const scoutData = useMemo(() => {
    return cats
      .map((cat) => {
        const d2025 = (cat_data[cat]?.[scoutUni] || []).find(
          (r) => r.year === 2025,
        );
        const entries = (cat_data[cat]?.[scoutUni] || [])
          .filter((r) => r.median_gross)
          .sort((a, b) => a.year - b.year);
        const growth =
          entries.length >= 2
            ? ((entries[entries.length - 1].median_gross -
                entries[0].median_gross) /
                entries[0].median_gross) *
              100
            : null;
        return {
          cat,
          median: d2025?.median_gross,
          emp: d2025?.emp_overall ? Number(d2025.emp_overall) : null,
          growth,
          score:
            scoutPriority === "salary"
              ? d2025?.median_gross || 0
              : scoutPriority === "employment"
                ? d2025?.emp_overall
                  ? Number(d2025.emp_overall)
                  : 0
                : scoutPriority === "growth"
                  ? growth || 0
                  : /* balanced */ (d2025?.median_gross || 0) / 100 +
                    (d2025?.emp_overall ? Number(d2025.emp_overall) : 0) +
                    (growth || 0) * 2,
        };
      })
      .filter((r) => r.median || r.emp)
      .sort((a, b) => b.score - a.score);
  }, [scoutUni, scoutPriority]);

  const views = [
    { id: "salary", label: "Salary Snapshot" },
    { id: "employment", label: "Employment Rate" },
    { id: "growth", label: "Salary Growth" },
    { id: "scout", label: "🎓 Field Scout" },
  ];

  const yAxisW = isMobile ? 100 : 160;
  const chartH = isMobile ? 700 : 560;

  // shared uni filter row
  const UniFilter = () => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {unis.map((u) => (
        <button
          key={u}
          onClick={() => toggleUni(u)}
          style={{
            color: activeUnis.has(u) ? UNI_COLORS[u] : "#333",
            background: activeUnis.has(u) ? `${UNI_COLORS[u]}18` : "#0d0f18",
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
  );

  const YearPicker = () => (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {years.map((y) => (
        <button
          key={y}
          onClick={() => setYr(y)}
          style={{
            padding: "3px 8px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            background: yr === y ? "#00C9A7" : "#13151f",
            color: yr === y ? "#000" : "#555",
            outline: y === 2025 && yr !== 2025 ? "1px solid #00C9A720" : "none",
          }}
        >
          {y}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {/* Sub-view tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: view === v.id ? "#00C9A7" : "#13151f",
              color: view === v.id ? "#000" : "#666",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ── SALARY SNAPSHOT ── */}
      {view === "salary" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  color: "#e0e0e0",
                  fontSize: 14,
                  fontWeight: 700,
                  margin: "0 0 4px 0",
                }}
              >
                Median Gross Salary by Field
              </h3>
              <p style={{ color: "#444", fontSize: 11, margin: 0 }}>
                All fields ranked by highest salary for the selected year
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <UniFilter />
              <YearPicker />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart
                data={salaryBar}
                layout="vertical"
                margin={{
                  top: 0,
                  right: isMobile ? 10 : 60,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a1d27"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={fmtK}
                  tick={{ fill: "#555", fontSize: isMobile ? 9 : 10 }}
                  domain={[0, 8500]}
                />
                <YAxis
                  type="category"
                  dataKey="cat"
                  tick={{ fill: "#888", fontSize: isMobile ? 9 : 11 }}
                  width={yAxisW}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#555", fontSize: 11 }} />
                {unis.map(
                  (u) =>
                    activeUnis.has(u) && (
                      <Bar
                        key={u}
                        dataKey={u}
                        fill={UNI_COLORS[u]}
                        radius={[0, 3, 3, 0]}
                        maxBarSize={10}
                      />
                    ),
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── EMPLOYMENT RATE ── */}
      {view === "employment" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  color: "#e0e0e0",
                  fontSize: 14,
                  fontWeight: 700,
                  margin: "0 0 4px 0",
                }}
              >
                Overall Employment Rate by Field
              </h3>
              <p style={{ color: "#444", fontSize: 11, margin: 0 }}>
                % of graduates who secured employment (full-time or part-time)
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <UniFilter />
              <YearPicker />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart
                data={empBar}
                layout="vertical"
                margin={{
                  top: 0,
                  right: isMobile ? 10 : 60,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a1d27"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "#555", fontSize: isMobile ? 9 : 10 }}
                  domain={[50, 100]}
                />
                <YAxis
                  type="category"
                  dataKey="cat"
                  tick={{ fill: "#888", fontSize: isMobile ? 9 : 11 }}
                  width={yAxisW}
                />
                <ReferenceLine
                  x={90}
                  stroke="#00C9A730"
                  strokeDasharray="4 4"
                  label={{
                    value: "90%",
                    fill: "#00C9A750",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
                <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                <Legend wrapperStyle={{ color: "#555", fontSize: 11 }} />
                {unis.map(
                  (u) =>
                    activeUnis.has(u) && (
                      <Bar
                        key={u}
                        dataKey={u}
                        fill={UNI_COLORS[u]}
                        radius={[0, 3, 3, 0]}
                        maxBarSize={10}
                      />
                    ),
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── SALARY GROWTH ── */}
      {view === "growth" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h3
              style={{
                color: "#e0e0e0",
                fontSize: 14,
                fontWeight: 700,
                margin: "0 0 4px 0",
              }}
            >
              Salary Growth Since Earliest Data
            </h3>
            <p style={{ color: "#444", fontSize: 11, margin: 0 }}>
              Cumulative % salary increase from first available year → 2025.
              Higher = field has grown faster.
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart
                data={growthData}
                layout="vertical"
                margin={{
                  top: 0,
                  right: isMobile ? 10 : 80,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a1d27"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "#555", fontSize: isMobile ? 9 : 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="cat"
                  tick={{ fill: "#888", fontSize: isMobile ? 9 : 11 }}
                  width={yAxisW}
                />
                <ReferenceLine x={0} stroke="#ffffff15" />
                <Tooltip formatter={(v, n) => [`+${v}%`, n]} />
                <Legend wrapperStyle={{ color: "#555", fontSize: 11 }} />
                {unis.map((u) => (
                  <Bar
                    key={u}
                    dataKey={u}
                    fill={UNI_COLORS[u]}
                    radius={[0, 3, 3, 0]}
                    maxBarSize={10}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── FIELD SCOUT ── */}
      {view === "scout" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h3
              style={{
                color: "#e0e0e0",
                fontSize: 14,
                fontWeight: 700,
                margin: "0 0 4px 0",
              }}
            >
              🎓 Field Scout
            </h3>
            <p style={{ color: "#444", fontSize: 11, margin: 0 }}>
              Find the best-fit field for your priority. Uses 2025 data.
            </p>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  color: "#444",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                University
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {unis.map((u) => (
                  <button
                    key={u}
                    onClick={() => setScoutUni(u)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      background: scoutUni === u ? UNI_COLORS[u] : "#13151f",
                      color: scoutUni === u ? "#000" : "#666",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  color: "#444",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                Rank by
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[
                  ["salary", "💰 Highest Salary"],
                  ["employment", "✅ Best Employment"],
                  ["growth", "📈 Fastest Growth"],
                  ["balanced", "⚖️ Balanced Score"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setScoutPriority(id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      background: scoutPriority === id ? "#00C9A7" : "#13151f",
                      color: scoutPriority === id ? "#000" : "#666",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Podium top 3 */}
          {(() => {
            const top3 = scoutData.slice(0, 3);
            const podOrder = [1, 0, 2]; // silver, gold, bronze layout
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  marginBottom: 28,
                  flexWrap: "wrap",
                }}
              >
                {podOrder.map((idx) => {
                  const d = top3[idx];
                  if (!d) return null;
                  const medals = ["🥇", "🥈", "🥉"];
                  const heights = [120, 100, 90];
                  return (
                    <div
                      key={d.cat}
                      style={{
                        background: `${UNI_COLORS[scoutUni]}15`,
                        border: `1px solid ${UNI_COLORS[scoutUni]}40`,
                        borderRadius: 12,
                        padding: "16px 20px",
                        textAlign: "center",
                        width: isMobile ? "100%" : 220,
                        borderTop:
                          idx === 0
                            ? `3px solid ${UNI_COLORS[scoutUni]}`
                            : "1px solid #1a1d27",
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>
                        {medals[idx]}
                      </div>
                      <div
                        style={{
                          color: "#e0e0e0",
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 8,
                          lineHeight: 1.4,
                        }}
                      >
                        {d.cat}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {d.median && (
                          <span
                            style={{
                              color: UNI_COLORS[scoutUni],
                              fontFamily: "'Space Mono',monospace",
                              fontSize: 15,
                              fontWeight: 800,
                            }}
                          >
                            {fmt(d.median)}
                          </span>
                        )}
                        {d.emp && (
                          <span style={{ color: "#4A90E2", fontSize: 11 }}>
                            ✅ {d.emp.toFixed(1)}% employed
                          </span>
                        )}
                        {d.growth && (
                          <span style={{ color: "#00C9A7", fontSize: 11 }}>
                            📈 +{d.growth.toFixed(0)}% since earliest
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Full ranked table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1d27" }}>
                  {["Rank", "Field", "2025 Salary", "Employment", "Growth"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "7px 10px",
                          color: "#444",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {scoutData.map((d, i) => (
                  <tr
                    key={d.cat}
                    style={{
                      borderBottom: "1px solid #0f111a",
                      background:
                        i < 3
                          ? `${UNI_COLORS[scoutUni]}08`
                          : i % 2 === 0
                            ? "#0b0d14"
                            : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 10px",
                        color: "#333",
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 11,
                      }}
                    >
                      {i === 0
                        ? "🥇"
                        : i === 1
                          ? "🥈"
                          : i === 2
                            ? "🥉"
                            : `#${i + 1}`}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        color: i < 3 ? UNI_COLORS[scoutUni] : "#aaa",
                        fontWeight: i < 3 ? 700 : 400,
                        fontSize: 12,
                      }}
                    >
                      {d.cat}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        color: UNI_COLORS[scoutUni],
                        fontFamily: "'Space Mono',monospace",
                        fontWeight: 700,
                      }}
                    >
                      {d.median ? fmt(d.median) : "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        color:
                          d.emp >= 90
                            ? "#00C9A7"
                            : d.emp >= 80
                              ? "#aaa"
                              : "#555",
                      }}
                    >
                      {d.emp ? `${d.emp.toFixed(1)}%` : "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        color:
                          d.growth > 50
                            ? "#00C9A7"
                            : d.growth > 25
                              ? "#aaa"
                              : "#555",
                      }}
                    >
                      {d.growth != null ? `+${d.growth.toFixed(0)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: "#2a2d3a", fontSize: 10, marginTop: 12 }}>
            Balanced score = salary/100 + employment% + growth%×2. All data from
            2025 GES.
          </p>
        </div>
      )}
    </div>
  );
}

export default CompareTab;
