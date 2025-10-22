import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListsPage from "./pages/ListsPage";
import ListDetailsPage from "./pages/ListDetailsPage";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { themeOptions } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={themeOptions}>
      <CssBaseline /> {/* ensures dark background and text styles apply */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ListsPage />} />
          <Route path="/lists/:id" element={<ListDetailsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
