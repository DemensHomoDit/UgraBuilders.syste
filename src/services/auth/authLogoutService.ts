import { db } from "@/integrations/db/client";
import { toast } from "@/components/ui/use-toast";
import { withRetry } from "@/utils/retry";

class AuthLogoutService {
  public async logout(): Promise<void> {
    return withRetry(async () => {
      const { error } = await db.auth.signOut();
      if (error) {
        throw error;
      }
    }, {
      onError: (error) => {
        toast({
          title: "Ошибка выхода",
          description: error?.message || "Неизвестная ошибка",
          variant: "destructive",
        });
      }
    });
  }
}

export default new AuthLogoutService();
