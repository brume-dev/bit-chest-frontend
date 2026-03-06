import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AdminGuard } from "./layouts/admin-guard";
import { AuthGuard } from "./layouts/auth-guard";
import { SidebarLayout } from "./layouts/sidebar-layout";
import { AdminDashboardPage } from "./pages/admin-dashboard-page";
import ClientsManagement from "./pages/ClientManagement";
import { IndexPage } from "./pages/index-page";
import { LoginPage } from "./pages/login-page";
import { ProfilePage } from "./pages/profile-page";
import { RegisterPage } from "./pages/register-page";
import "./index.css";
import { PortfolioPage } from "./pages/portfolio-page";
import { CryptoPage } from "./pages/crypto-page";
import { TradesPage } from "./pages/trades-page";

// Initialize React Query client
const queryClient = new QueryClient();

// Setup app routing and authentication guards
// biome-ignore lint/style/noNonNullAssertion: <>
createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Protected routes requiring authentication */}
          <Route element={<AuthGuard />}>
            {/* Sidebar layout for authenticated pages */}
            <Route element={<SidebarLayout />}>
              <Route path="/" element={<IndexPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/trade" element={<TradesPage />} />
              <Route path="/cryptos" element={<CryptoPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              {/* Admin-only routes */}
              <Route element={<AdminGuard />}>
                <Route path="/clients" element={<ClientsManagement />} />
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
              </Route>
            </Route>
          </Route>
          {/* Public routes for auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
