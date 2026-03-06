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
import { TradesPage } from "./pages/trades-page";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: <>
createRoot(document.querySelector("#root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Routes>
					<Route element={<AuthGuard />}>
						<Route element={<SidebarLayout />}>
							<Route path="/" element={<IndexPage />} />
							<Route path="/portfolio" element={<PortfolioPage />} />
							<Route path="/profile" element={<ProfilePage />} />
							<Route path="/trade" element={<TradesPage />} />
							<Route element={<AdminGuard />}>
								<Route path="/clients" element={<ClientsManagement />} />
								<Route
									path="/admin-dashboard"
									element={<AdminDashboardPage />}
								/>
							</Route>
						</Route>
					</Route>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);
