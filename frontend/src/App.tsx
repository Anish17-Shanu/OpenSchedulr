import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/login-page";
import { DashboardPage } from "./pages/dashboard-page";
import { useAuthStore } from "./store/auth-store";

export default function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/" replace />} />
    </Routes>
  );
}
