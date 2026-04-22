import React from "react";
import type { User as AuthUser } from "@/hooks/useAuth";
import type { User as TypesUser } from "@/services/types/authTypes";

// Adapter component that converts the useAuth User type to the authTypes User type
interface UserTypeWrapperProps {
  user: AuthUser;
  children: (user: TypesUser) => React.ReactNode;
}

export const UserTypeWrapper: React.FC<UserTypeWrapperProps> = ({
  user,
  children,
}) => {
  // Нормализуем роль пользователя
  let normalizedRole = "client"; // Роль по умолчанию
  if (typeof user.role === "string") {
    normalizedRole = user.role;
  } else if (Array.isArray(user.role) && user.role.length > 0) {
    // Если роль - массив, используем первый элемент
    // Приоритет ролей: admin > manager > editor > client
    if (user.role.includes("admin")) {
      normalizedRole = "admin";
    } else if (user.role.includes("manager")) {
      normalizedRole = "manager";
    } else if (user.role.includes("editor")) {
      normalizedRole = "editor";
    } else if (user.role.includes("client")) {
      normalizedRole = "client";
    } else {
      normalizedRole = user.role[0];
    }
  }

  // Convert the useAuth User type to the authTypes User type
  const convertedUser: TypesUser = {
    id: user.id,
    username: user.username || "",
    email: user.email,
    role: normalizedRole,
    phone: user.phone || null,
    avatar: user.avatar || null,
    clientStage: user.clientStage || "",
    folders: user.folders
      ? {
          photos: user.folders.photos || [],
          documents: user.folders.documents || [],
          contracts: user.folders.contracts || [],
        }
      : {
          photos: [],
          documents: [],
          contracts: [],
        },
    projectStats: user.projectStats
      ? {
          totalArea: user.projectStats.totalArea || 0,
          completedArea: user.projectStats.completedArea || 0,
          materialsUsed: user.projectStats.materialsUsed || 0,
          workHours: user.projectStats.workHours || 0,
          startDate: user.projectStats.startDate || "",
          estimatedEndDate: user.projectStats.estimatedEndDate || "",
          actualEndDate: user.projectStats.actualEndDate,
          total: user.projectStats.total,
          completed: user.projectStats.completed,
          inProgress: user.projectStats.inProgress,
          planned: user.projectStats.planned,
        }
      : {
          totalArea: 0,
          completedArea: 0,
          materialsUsed: 0,
          workHours: 0,
          startDate: "",
          estimatedEndDate: "",
        },
  };

  return <>{children(convertedUser)}</>;
};
