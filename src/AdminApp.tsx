import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import RouteFallback from "@/components/RouteFallback";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMemberForm = lazy(() => import("./pages/admin/AdminMemberForm"));

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
      </Routes>
    </Suspense>
  </AuthProvider>
);

export default AdminApp;
