import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AuthTabs from "@/components/account/AuthTabs";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminModeration from "@/components/admin/AdminModeration";
import ManagerDashboard from "@/components/manager/ManagerDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminGallery from "@/components/admin/AdminGallery";
import { NewsManagement } from "@/components/admin/content/news-management";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { useSessionSync } from "@/hooks/useSessionSync";
import { UserTypeWrapper } from "@/components/UserTypeWrapper";
import ProjectForm from "@/components/admin/content/project-form/ProjectForm";
import AdminProjectDetails from "@/pages/admin/ProjectDetails";
import FormsPage from "@/pages/admin/FormsPage";
import ClientDashboard from "@/components/client/ClientDashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Account = () => {
  const { user, loading, error, logout, syncUserData } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const sessionSync = useSessionSync();
  const isOnline = sessionSync?.isOnline ?? true;
  const manualSync = sessionSync?.manualSync ?? (() => Promise.resolve(false));

  const role = user ? (Array.isArray(user.role) ? user.role[0] : user.role) : null;
  const isAdminRoute = location.pathname.startsWith("/account/") && location.pathname !== "/account";

  useEffect(() => {
    if (error) {
      toast({ title: "Ошибка загрузки", description: error, variant: "destructive" });
    }
  }, [error, toast]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const result = await logout();
      if (result.success) {
        toast({ title: "Вы вышли из аккаунта" });
        navigate("/", { replace: true });
      }
    } catch {
      toast({ title: "Ошибка выхода", variant: "destructive" });
    }
  };

  const handleRetry = () => {
    syncUserData();
    manualSync();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-12 text-center px-4 pt-32">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Ошибка загрузки профиля</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Повторить
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="max-w-md w-full">
            <AuthTabs onSuccessfulAuth={() => {}} />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Client — separate layout
  if (role === "client") {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-16 md:pt-20">
          <UserTypeWrapper user={user}>
            {(convertedUser) => (
              <ClientDashboard user={convertedUser} onLogout={handleLogout} />
            )}
          </UserTypeWrapper>
        </div>
        <Footer />
      </main>
    );
  }

  // Admin / Manager / Editor — shared admin layout with role-based routing
  return (
    <UserTypeWrapper user={user}>
      {(convertedUser) => (
        <AdminLayout user={convertedUser} onLogout={handleLogout}>
          <Routes>
            <Route
              path="/"
              element={
                role === "manager" ? (
                  <ManagerDashboard user={convertedUser} />
                ) : (
                  <AdminDashboard user={convertedUser} />
                )
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin", "editor", "manager"]}>
                  <AdminProjects user={convertedUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin", "editor", "manager"]}>
                  <ProjectForm user={convertedUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/edit/:id"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin", "editor", "manager"]}>
                  <AdminProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gallery"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin", "editor"]}>
                  <AdminGallery user={convertedUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/moderation"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin", "editor"]}>
                  <AdminModeration user={convertedUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin", "manager"]}>
                  <FormsPage user={convertedUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin", "editor", "manager"]}>
                  <NewsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute user={convertedUser} allowedRoles={["admin"]}>
                  <AdminUsers user={convertedUser} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/account" replace />} />
          </Routes>
        </AdminLayout>
      )}
    </UserTypeWrapper>
  );
};

export default Account;
