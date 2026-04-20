import { Navigate } from "react-router-dom";
import { User } from "@/services/types/authTypes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  user,
  allowedRoles,
}) => {
  const role = Array.isArray(user.role) ? user.role[0] : user.role;
  if (!allowedRoles.includes(role || "client")) {
    return <Navigate to="/account" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
