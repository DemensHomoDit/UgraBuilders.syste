import { db } from "@/integrations/db/client";
import { toast } from "@/components/ui/use-toast";
import { User } from "../types/authTypes";
import { transformProfileToUser } from "../utils/authUtils";
import notificationService from "@/services/notifications/notificationService";

class ClientStageService {
  public async updateClientSaleStage(
    clientId: string,
    stage: string,
  ): Promise<User | null> {
    try {
      const { data, error } = await db
        .from("user_profiles")
        .update({ client_stage: stage })
        .eq("id", clientId)
        .select()
        .single();

      if (error) {
        console.error("Error updating client sale stage:", error.message);
        toast({
          title: "Ошибка обновления",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Отправляем уведомление клиенту о смене этапа продажи
      try {
        await notificationService.notifyClientSaleStageChange(clientId, stage);
      } catch (notifyError) {
        console.error(
          "Ошибка при отправке уведомления о смене этапа клиента:",
          notifyError,
        );
      }

      const { data: userData } = await db.from('users').select('phone, avatar').eq('id', clientId).maybeSingle();
      return { ...transformProfileToUser(data), phone: userData?.phone || null, avatar: userData?.avatar || null };
    } catch (error) {
      console.error("Error in updateClientSaleStage:", error);
      return null;
    }
  }
}

export default new ClientStageService();
