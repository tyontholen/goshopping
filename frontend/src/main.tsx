import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListsPage from "./pages/ListsPage";
import ListDetailsPage from "./pages/ListDetailsPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListsPage />} />
        <Route path="/lists/:id" element={<ListDetailsPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
