import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "antd/dist/reset.css";
import { AuthProvider } from "./context/AuthContext";
import { OnlineStatusProvider } from "./context/OnlineStatusContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <OnlineStatusProvider>
        <App />
      </OnlineStatusProvider>
    </AuthProvider>
  </StrictMode>
);
