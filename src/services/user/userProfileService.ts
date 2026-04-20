import { db } from "@/integrations/db/client";
import { toast } from "sonner";
import { User } from "../types/authTypes";
import { transformProfileToUser } from "../utils/authUtils";

class UserProfileService {
  public async getUsersList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: User[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    stats: {
      total: number;
      admin_count: number;
      editor_count: number;
      manager_count: number;
      client_count: number;
    };
  }> {
    try {
      const { data: session } = await db.auth.getSession();
      const token = session?.session?.access_token;
      const apiBase = import.meta.env.VITE_API_BASE ?? "";

      const query = new URLSearchParams({
        page: String(params?.page ?? 1),
        limit: String(params?.limit ?? 20),
        search: params?.search ?? "",
        role: params?.role ?? "all",
      });

      const response = await fetch(`${apiBase}/api/admin/users/list?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const body = await response.json();

      if (!response.ok || !body?.success) {
        throw new Error(body?.error || "Не удалось загрузить пользователей");
      }

      return {
        users: (body.data || []) as User[],
        pagination: body.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
        stats: body.stats || {
          total: 0,
          admin_count: 0,
          editor_count: 0,
          manager_count: 0,
          client_count: 0,
        },
      };
    } catch (error: any) {
      console.error("Error in getUsersList:", error);
      return {
        users: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
        stats: {
          total: 0,
          admin_count: 0,
          editor_count: 0,
          manager_count: 0,
          client_count: 0,
        },
      };
    }
  }

  public async getAllUsers(): Promise<User[]> {
    try {
      const { data: profiles, error } = await db
        .from('user_profiles')
        .select('*');

      if (error) {
        console.error("Error fetching all users:", error.message);
        return [];
      }

      return profiles.map(profile => transformProfileToUser(profile));
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  }

  public async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: profile, error } = await db
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user:", error.message);
        return null;
      }

      if (!profile) {
        return null;
      }

      return transformProfileToUser(profile);
    } catch (error) {
      console.error("Error in getUserById:", error);
      return null;
    }
  }

  public async createUser(username: string, email: string, password: string, role: string): Promise<User | null> {
    try {
      // Using the admin API to create a user with a custom role
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: { 
            username,
            role 
          }
        }
      });

      if (error) {
        console.error("Error creating user:", error.message);
        toast("Ошибка создания пользователя: " + error.message, {
          description: "Проверьте, не существует ли уже пользователь с таким email"
        });
        return null;
      }

      if (!data.user) {
        console.error("No user data returned after creation");
        return null;
      }
      // Create the user profile with the specified role
      const { data: profileData, error: profileError } = await db
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          username,
          role
        })
        .select()
        .single();

      if (profileError) {
        console.error("Error creating profile:", profileError.message);
        toast("Профиль создан с ошибкой: " + profileError.message);
        return null;
      }

      toast("Пользователь создан успешно", {
        description: `Пользователь ${username} успешно создан с ролью ${role}`
      });

      return transformProfileToUser(profileData);
    } catch (error) {
      console.error("Error in createUser:", error);
      toast("Непредвиденная ошибка при создании пользователя");
      return null;
    }
  }

  public async deleteUser(userId: string): Promise<boolean> {
    try {
      // First check if user is admin
      const { data: profileData, error: profileError } = await db
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Error checking user role:", profileError.message);
        toast("Ошибка удаления пользователя", {
          description: "Не удалось проверить роль пользователя"
        });
        return false;
      }
      
      // Do not allow deletion of admin users
      if (profileData.role === 'admin') {
        console.error("Cannot delete admin user");
        toast("Ошибка удаления пользователя", {
          description: "Администраторов нельзя удалить"
        });
        return false;
      }
      
      // Вызываем RPC функцию для удаления пользователя
      // С безопасной передачей ID пользователя
      const { data, error } = await db.rpc('admin_delete_user', {
        user_id: userId
      });
      
      if (error) {
        console.error("Error deleting user:", error.message);
        toast("Ошибка удаления пользователя", {
          description: error.message || "Произошла ошибка при удалении пользователя"
        });
        return false;
      }
      
      toast("Пользователь удален", {
        description: "Пользователь был успешно удален из системы"
      });
      
      return true;
    } catch (error) {
      console.error("Error in deleteUser:", error);
      toast("Непредвиденная ошибка при удалении пользователя");
      return false;
    }
  }

  public async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const { data: session } = await db.auth.getSession();
      const token = session?.session?.access_token;
      const apiBase = import.meta.env.VITE_API_BASE ?? "";

      const response = await fetch(`${apiBase}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role }),
      });
      const body = await response.json();

      if (!response.ok || !body?.success) {
        throw new Error(body?.error || "Не удалось обновить роль");
      }

      return true;
    } catch (error: any) {
      console.error("Error in updateUserRole:", error);
      toast.error("Не удалось обновить роль пользователя");
      return false;
    }
  }
}

export default new UserProfileService();
