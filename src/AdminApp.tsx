import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import RouteFallback from "@/components/RouteFallback";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMemberForm = lazy(() => import("./pages/admin/AdminMemberForm"));
const AdminOpportunitiesDashboard = lazy(() => import("./pages/admin/AdminOpportunitiesDashboard"));
const AdminOpportunityForm = lazy(() => import("./pages/admin/AdminOpportunityForm"));

/**
 * Subárbol administrativo, montado solo bajo /admin/*. Mantenerlo separado
 * de las rutas públicas evita que @supabase/supabase-js y la verificación
 * de sesión (AuthProvider) se carguen para el 100% de las visitas públicas
 * que nunca acceden al panel.
 */
const AdminApp = () => (
  <AuthProvider>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          index
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="members/new"
          element={
            <ProtectedRoute>
              <AdminMemberForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="members/:id"
          element={
            <ProtectedRoute>
              <AdminMemberForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="opportunities"
          element={
            <ProtectedRoute>
              <AdminOpportunitiesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="opportunities/new"
          element={
            <ProtectedRoute>
              <AdminOpportunityForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="opportunities/:id"
          element={
            <ProtectedRoute>
              <AdminOpportunityForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  </AuthProvider>
);

export default AdminApp;
