import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/auth/RoleGuard";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import MerchantsPage from "@/pages/MerchantsPage";
import UsersPage from "@/pages/UsersPage";
import ProductsPage from "@/pages/ProductsPage";
import SalesPage from "@/pages/SalesPage";
import ExpensesPage from "@/pages/ExpensesPage";
import CashiersPage from "@/pages/CashiersPage";
import ReportsPage from "@/pages/ReportsPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <RoleGuard allowedRoles={["superadmin", "admin", "supervisor"]}>
            <AppLayout />
          </RoleGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/merchants"
          element={
            <RoleGuard allowedRoles={["superadmin"]}>
              <MerchantsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/users"
          element={
            <RoleGuard allowedRoles={["superadmin", "admin"]}>
              <UsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/cashiers"
          element={
            <RoleGuard allowedRoles={["superadmin", "admin"]}>
              <CashiersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/products"
          element={
            <RoleGuard allowedRoles={["superadmin", "admin"]}>
              <ProductsPage />
            </RoleGuard>
          }
        />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route
          path="/reports"
          element={
            <RoleGuard allowedRoles={["superadmin", "admin", "supervisor"]}>
              <ReportsPage />
            </RoleGuard>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
