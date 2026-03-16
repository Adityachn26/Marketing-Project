import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ReportProvider } from "./reportContext";
import { ThemeProvider } from "./themeContext";
import { AuthProvider } from "./authContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ReportProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ReportProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

