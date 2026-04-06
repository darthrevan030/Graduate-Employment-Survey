import React from "react";
import ReactDOM from "react-dom/client";
import GESDashboard from "./components/gesDashboard.jsx";

import { inject } from "@vercel/analytics"

inject()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GESDashboard />
  </React.StrictMode>,
);
