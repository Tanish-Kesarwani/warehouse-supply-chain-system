import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage } from "./pages/LoginPage";
import { MastersPage } from "./pages/MastersPage";
import { MonitoringPage } from "./pages/MonitoringPage";
import { ProcurementPage } from "./pages/ProcurementPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProtectedRoute } from "./modules/auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/masters" element={<MastersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/procurement" element={<ProcurementPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
