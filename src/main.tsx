import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthGuard } from "./layouts/auth-guard";
import { IndexPage } from "./pages/index-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import "./index.css";
import { ProfilePage } from "./pages/profile-page";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: <>
createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route path="/" element={<IndexPage />} />
            <Route path="/profile" element={<ProfilePage/>} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
