import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

// Sentry 초기화 - 앱 시작 시 가장 먼저 실행되도록 상단에 배치
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // 400번대 에러(Client Error)는 Sentry에 보고하지 않음
    const error = hint.originalException;
    if (
      error &&
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500
    ) {
      return null;
    }
    return event;
  },
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
