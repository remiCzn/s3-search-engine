import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Index from "./pages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchResult from "./pages/search-result";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search-result" element={<SearchResult />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
