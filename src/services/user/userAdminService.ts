import { toast } from "sonner";

/**
 * Сервис для административных операций с пользователями через API сервера
 * Используется для операций, требующих привилегий администратора, которые не могут 
 * быть выполнены напрямую в клиентском коде из соображений безопасности
 */
class UserAdminService {
  /**
   * Удаляет пользователя через API сервера
   * @param userId Идентификатор пользователя
   * @returns Promise<boolean> Успешно ли удаление
   */
  public async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        console.error("Invalid user ID");
        return false;
      }
      
      // Отправляем запрос на сервер для удаления через API
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      // Проверяем, что ответ получен
      if (!response) {
        throw new Error("Нет ответа от сервера");
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error from server:", data.error);
        toast("Ошибка удаления пользователя", {
          description: data.error || "Ошибка на сервере"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in admin deleteUser:", error);
      toast("Ошибка соединения с сервером", {
        description: "Убедитесь, что запущен сервер API на порту 3001"
      });
      return false;
    }
  }
}

export default new UserAdminService(); 