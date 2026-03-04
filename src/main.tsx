import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthGuard } from "./layouts/auth-guard";
import { SidebarLayout } from "./layouts/sidebar-layout";
import { DashboardPage } from "./pages/dashboard-page";
import { LoginPage } from "./pages/login-page";
import { ProfilePage } from "./pages/profile-page";
import { RegisterPage } from "./pages/register-page";
import "./index.css";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: <>
createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route element={<SidebarLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<DashboardPage />} />
            </Route>
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
