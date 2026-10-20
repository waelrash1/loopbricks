import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";

// paper can't click to unfold, so folded references open for printing
window.addEventListener("beforeprint", () => document.querySelectorAll<HTMLDetailsElement>("details#case-refs").forEach((d) => (d.open = true)));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
