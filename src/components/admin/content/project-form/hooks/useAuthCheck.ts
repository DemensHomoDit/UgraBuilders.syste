
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

export const checkAuthAndGetUserId = async (): Promise<string | null> => {
  try {
    const { data } = await db.auth.getSession();
    const session = data?.session;
    
    if (!session) {
      console.error("Ошибка: сессия не найдена");
      toast.error("Необходимо войти в систему");
      return null;
    }
    
    if (!session.user) {
      console.error("Ошибка: пользователь не найден в сессии");
      toast.error("Информация о пользователе недоступна");
      return null;
    }
    
    const userId = session.user.id;
    if (!userId) {
      console.error("Ошибка: ID пользователя не определен");
      toast.error("Не удалось определить ID пользователя");
      return null;
    }
    
    return userId;
  } catch (error: any) {
    console.error("Ошибка при получении данных пользователя:", error);
    toast.error("Ошибка аутентификации");
    return null;
  }
};
