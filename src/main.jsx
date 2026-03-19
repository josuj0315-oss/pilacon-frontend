import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

// Sentry 초기화 - 앱 시작 시 가장 먼저 실행되도록 상단에 배치
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./components/modal.css";

import { PilaConProvider } from "./store/pilaconStore";
import { CategoryProvider } from "./context/CategoryContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PilaConProvider>
      <CategoryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CategoryProvider>
    </PilaConProvider>
  </React.StrictMode>
);
