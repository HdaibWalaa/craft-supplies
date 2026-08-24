import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { ThemeManager } from "@/components/theme/ThemeManager";
import App from "@/App";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeManager>
      <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>
    </ThemeManager>
  </StrictMode>,
);
