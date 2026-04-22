import { User, ProjectStats, ProjectContacts } from "../types/authTypes";

/**
 * Безопасная функция для парсинга JSON, которая возвращает значение по умолчанию в случае ошибки
 */
export function safeJsonParse<T>(
  jsonString: string | null | undefined | any,
  defaultValue: T,
): T {
  if (jsonString === null || jsonString === undefined) return defaultValue;

  // Если входной параметр не строка, возвращаем исходный объект, если он соответствует типу T
  if (typeof jsonString !== "string") {
    try {
      // Преобразуем в JSON и обратно для проверки структуры
      const validated = JSON.parse(JSON.stringify(jsonString));
      return validated as T;
    } catch (error) {
      console.error("Ошибка при валидации нестрокового JSON:", error);
      return defaultValue;
    }
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Ошибка при парсинге JSON:", error);
    return defaultValue;
  }
}

/**
 * Преобразует данные профиля пользователя из базы данных в объект User
 */
export function transformProfileToUser(profileData: any): User {
  if (!profileData) return {} as User;

  const emptyFolders = { photos: [], documents: [], contracts: [] };

  return {
    id: profileData.id,
    email: profileData.email || "",
    username: profileData.username || "",
    role: profileData.role || "client",
    phone: profileData.phone || null,
    avatar: profileData.avatar || null,
    clientStage: profileData.client_stage,
    schedule: safeJsonParse(profileData.schedule, []),
    cameras: safeJsonParse(profileData.cameras, []),
    folders: safeJsonParse(profileData.folders, emptyFolders),
    projectStats: safeJsonParse(
      profileData.project_stats,
      undefined as unknown as ProjectStats,
    ),
    projectContacts: safeJsonParse(
      profileData.project_contacts,
      undefined as unknown as ProjectContacts,
    ),
  };
}
