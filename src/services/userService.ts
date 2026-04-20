import userProfileService from "./user/userProfileService";
import clientStageService from "./user/clientStageService";
import {
  User,
  UserRole,
  ContactPerson,
  ProjectContacts,
} from "./types/authTypes";
import { db } from "@/integrations/db/client";

// Интерфейс для информации о проекте
interface ProjectInfo {
  id: string;
  title: string;
  address: string;
  type: string;
  status: string;
  coverImage: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  currentStage?: string;
}

// Интерфейс для задачи
interface ProjectTask {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "planned";
}

class UserService {
  public async getUsersList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    return userProfileService.getUsersList(params);
  }

  // User profile methods
  public async getAllUsers(): Promise<User[]> {
    return userProfileService.getAllUsers();
  }

  public async createUser(
    username: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<User | null> {
    return userProfileService.createUser(username, email, password, role);
  }

  public async deleteUser(userId: string): Promise<boolean> {
    return userProfileService.deleteUser(userId);
  }

  public async updateUserRole(userId: string, role: string): Promise<boolean> {
    return userProfileService.updateUserRole(userId, role);
  }

  // Client stage methods
  public async updateClientSaleStage(
    clientId: string,
    stage: string,
  ): Promise<User | null> {
    return clientStageService.updateClientSaleStage(clientId, stage);
  }

  // Client dashboard methods
  public async getClientContacts(
    clientId: string,
  ): Promise<{ manager?: ContactPerson; foreman?: ContactPerson }> {
    try {
      // Сначала получаем проект клиента
      let projectId: string | null = null;

      // Проверяем, есть ли у пользователя привязка к проекту в user_profiles
      const { data: userProfile } = await db
        .from("user_profiles")
        .select("project_id")
        .eq("id", clientId)
        .maybeSingle();

      if (userProfile?.project_id) {
        projectId = userProfile.project_id;
      } else {
        // Пробуем найти в project_orders
        const { data: orders } = await db
          .from("project_orders")
          .select("project_id")
          .eq("client_id", clientId)
          .limit(1);

        if (orders && orders.length > 0 && orders[0].project_id) {
          projectId = orders[0].project_id;
        }
      }

      // Если проект определен - ищем его менеджера и прораба
      const result: { manager?: ContactPerson; foreman?: ContactPerson } = {};

      if (projectId) {
        // Ищем пользователей, связанных с проектом
        const { data: projectStaff } = await db
          .from("user_profiles")
          .select("id, username, role, avatar_url, email, phone")
          .in("role", ["manager", "foreman"])
          .order("created_at", { ascending: false });

        if (projectStaff && projectStaff.length > 0) {
          // Ищем менеджера
          const manager = projectStaff.find(
            (staff) => staff.role === "manager",
          );
          if (manager) {
            result.manager = {
              id: manager.id,
              fullName: manager.username,
              role: "Старший менеджер проекта",
              avatar: manager.avatar_url,
              phone: manager.phone,
              email: manager.email,
            };
          }

          // Ищем прораба
          const foreman = projectStaff.find(
            (staff) => staff.role === "foreman",
          );
          if (foreman) {
            result.foreman = {
              id: foreman.id,
              fullName: foreman.username,
              role: "Прораб строительного участка",
              avatar: foreman.avatar_url,
            };
          }
        }
      }

      // Если не удалось найти контакты через проект - ищем любых менеджеров и прорабов
      if (!result.manager || !result.foreman) {
        // Получаем информацию о менеджере (ищем пользователя с ролью manager)
        const { data: managers } = await db
          .from("user_profiles")
          .select("id, username, role, avatar_url, email, phone")
          .eq("role", "manager")
          .limit(1);

        // Получаем информацию о прорабе (ищем пользователя с ролью foreman)
        const { data: foremen } = await db
          .from("user_profiles")
          .select("id, username, role, avatar_url, email, phone")
          .eq("role", "foreman")
          .limit(1);

        if (!result.manager && managers && managers.length > 0) {
          const manager = managers[0];
          result.manager = {
            id: manager.id,
            fullName: manager.username,
            role: "Старший менеджер проекта",
            avatar: manager.avatar_url,
            phone: manager.phone,
            email: manager.email,
          };
        }

        if (!result.foreman && foremen && foremen.length > 0) {
          const foreman = foremen[0];
          result.foreman = {
            id: foreman.id,
            fullName: foreman.username,
            role: "Прораб строительного участка",
            avatar: foreman.avatar_url,
          };
        }
      }

      return result;
    } catch (error) {
      console.error("Ошибка при получении контактов:", error);
      return {};
    }
  }

  public async getClientProject(clientId: string): Promise<ProjectInfo | null> {
    try {
      // Сначала проверяем, есть ли у пользователя привязка к проекту в user_profiles
      const { data: userProfile, error: profileError } = await db
        .from("user_profiles")
        .select("id, project_id")
        .eq("id", clientId)
        .single();

      // Если есть ошибка или профиль не найден
      if (profileError || !userProfile) {
        console.error(
          "Ошибка при получении профиля пользователя:",
          profileError?.message || "Профиль не найден",
        );

        // Пробуем найти заказы проектов от клиента в project_orders
        const { data: orders, error: ordersError } = await db
          .from("project_orders")
          .select("project_id")
          .eq("client_id", clientId)
          .limit(1);

        if (ordersError || !orders || orders.length === 0) {
          console.error(
            "Заказы проектов не найдены:",
            ordersError?.message || "Нет заказов",
          );
          return null;
        }

        // Если нашли заказ - ищем проект
        const { data: project, error: projectError } = await db
          .from("projects")
          .select("*")
          .eq("id", orders[0].project_id)
          .single();

        if (projectError || !project) {
          console.error("Проект по заказу не найден:", projectError?.message);
          return null;
        }

        return this.mapProjectData(project);
      }

      // Если у пользователя есть привязка к проекту - получаем проект
      if (userProfile.project_id) {
        const { data: project, error: projectError } = await db
          .from("projects")
          .select("*")
          .eq("id", userProfile.project_id)
          .single();

        if (projectError || !project) {
          console.error("Проект не найден:", projectError?.message);
          return null;
        }

        return this.mapProjectData(project);
      }

      // Если у пользователя нет привязки - попробуем найти любой проект
      const { data: projects, error: projectsError } = await db
        .from("projects")
        .select("*")
        .limit(1);

      if (projectsError || !projects || projects.length === 0) {
        console.error("Проекты не найдены:", projectsError?.message);
        return null;
      }

      return this.mapProjectData(projects[0]);
    } catch (error) {
      console.error("Ошибка при получении проекта клиента:", error);
      return null;
    }
  }

  // Маппер данных проекта из БД в формат для фронтенда
  private mapProjectData(project: any): ProjectInfo {
    return {
      id: project.id,
      title: project.title || project.name || "Дом из клееного бруса",
      address: project.location || project.address || "Московская область",
      type: project.category_id
        ? `Категория ${project.category_id}`
        : "Индивидуальный проект",
      status: project.status || "in-progress",
      coverImage: project.cover_image || "",
      startDate: project.start_date || project.created_at,
      endDate: project.end_date || project.estimated_end_date,
      progress: project.progress !== undefined ? project.progress : 45,
      currentStage: project.current_stage || "Монтаж кровли",
    };
  }

  public async getClientTasks(clientId: string): Promise<ProjectTask[]> {
    try {
      // Сначала получаем проект клиента (через user_profiles или project_orders)
      let projectId: string | null = null;

      // Проверяем, есть ли у пользователя привязка к проекту в user_profiles
      const { data: userProfile, error: profileError } = await db
        .from("user_profiles")
        .select("project_id")
        .eq("id", clientId)
        .maybeSingle();

      if (!profileError && userProfile && userProfile.project_id) {
        projectId = userProfile.project_id;
      } else {
        // Пробуем найти в project_orders
        const { data: orders, error: ordersError } = await db
          .from("project_orders")
          .select("project_id")
          .eq("client_id", clientId)
          .limit(1);

        if (
          !ordersError &&
          orders &&
          orders.length > 0 &&
          orders[0].project_id
        ) {
          projectId = orders[0].project_id;
        }
      }

      // Если нашли projectId, пробуем получить задачи связанные с проектом
      if (projectId) {
        const { data: projectTasks, error: tasksError } = await db
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (!tasksError && projectTasks && projectTasks.length > 0) {
          // Если задач много, ограничиваем до 5
          const limitedTasks =
            projectTasks.length > 5 ? projectTasks.slice(0, 5) : projectTasks;

          // Преобразуем данные из БД в формат ProjectTask
          return limitedTasks.map((task) => ({
            id: task.id,
            title: task.title,
            date: task.due_date || task.created_at,
            status: this.mapTaskStatus(task.status),
          }));
        }
      }

      // Если не нашли задачи по проекту или проект не найден, пробуем получить задачи напрямую по client_id
      const { data: clientTasks, error: clientTasksError } = await db
        .from("tasks")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (!clientTasksError && clientTasks && clientTasks.length > 0) {
        // Если задач много, ограничиваем до 5
        const limitedTasks =
          clientTasks.length > 5 ? clientTasks.slice(0, 5) : clientTasks;

        // Преобразуем данные из БД в формат ProjectTask
        return limitedTasks.map((task) => ({
          id: task.id,
          title: task.title,
          date: task.due_date || task.created_at,
          status: this.mapTaskStatus(task.status),
        }));
      }

      // Если не нашли задачи ни по проекту, ни по клиенту - пробуем получить любые задачи
      const { data: tasks, error: tasksError } = await db
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!tasksError && tasks && tasks.length > 0) {
        // Преобразуем данные из БД в формат ProjectTask
        return tasks.map((task) => ({
          id: task.id,
          title: task.title,
          date: task.due_date || task.created_at,
          status: this.mapTaskStatus(task.status),
        }));
      }

      return [];
    } catch (error) {
      console.error("Ошибка при получении задач:", error);
      return [];
    }
  }

  // Преобразует статус из БД в нужный формат
  private mapTaskStatus(
    status: string,
  ): "completed" | "in-progress" | "planned" {
    if (!status) return "planned";

    const statusLower = status.toLowerCase();

    if (
      statusLower.includes("compl") ||
      statusLower.includes("done") ||
      statusLower.includes("finish")
    ) {
      return "completed";
    } else if (
      statusLower.includes("progress") ||
      statusLower.includes("ongoing") ||
      statusLower.includes("start")
    ) {
      return "in-progress";
    } else {
      return "planned";
    }
  }
}

export default new UserService();
