import "@mantine/core/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import {App} from "./App";

const element = document.getElementById("root");

if (!element) {
  throw new Error("Application insertion point, '#root', not found in dom.");
}

ReactDOM.createRoot(element).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
