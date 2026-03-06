import { useState } from "react";
import { useBreakpoint } from "..useBreakpoint.js";
import { UNI_COLORS } from "..theme.js";
import TabBtn from "..TabBtn.jsx";
import OverviewTab from "..OverviewTab.jsx";
import ByCategoryTab from "..ByCategoryTab.jsx";
import ByUniversityTab from "..ByUniversityTab.jsx";
import CompareTab from "..CompareTab.jsx";

export default function GESDashboard() {
  const [tab, setTab] = useState("overview");
  const { isMobile } = useBreakpoint();
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "category", label: "By Field" },
    { id: "university", label: "By University" },
    { id: "compare", label: "Compare All" },
  ];

  return (
    <div
      style={{
        background: "#080a0f",
        minHeight: "100vh",
        color: "#e0e0e0",
        fontFamily: "'DM Sans', sans-serif",
        padding: isMobile ? "16px 12px" : "28px 24px",
        maxWidth: "100vw",
        margin: "0 auto",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              color: "#333",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Ministry of Education Singapore · 2013–2025
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 18 : 24,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            Graduate Employment Survey
          </h1>
          <p style={{ color: "#444", fontSize: 11, margin: "4px 0 0 0" }}>
            1,672 records · 6 universities · 13 years · 2025 data included
          </p>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(UNI_COLORS).map(([u, c]) => (
              <span
                key={u}
                style={{
                  background: `${c}18`,
                  border: `1px solid ${c}33`,
                  color: c,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {u}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: isMobile ? 4 : 6,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {tabs.map((t) => (
          <TabBtn
            key={t.id}
            label={t.label}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
          />
        ))}
      </div>

      <div
        style={{
          background: "#0d0f18",
          borderRadius: 16,
          border: "1px solid #1a1d27",
          padding: isMobile ? "14px 12px" : "24px",
        }}
      >
        {tab === "overview" && <OverviewTab />}
        {tab === "category" && <ByCategoryTab />}
        {tab === "university" && <ByUniversityTab />}
        {tab === "compare" && <CompareTab />}
      </div>

      <div
        style={{
          marginTop: 20,
          color: "#4c5063",
          fontSize: 10,
          textAlign: "center",
        }}
      >
        Source: data.gov.sg (2013–2024) · MOE GES PDFs (2025) · Ministry of
        Education Singapore
      </div>
    </div>
  );
}
