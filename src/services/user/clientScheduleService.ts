
import { db } from "@/integrations/db/client";
import { toast } from "@/components/ui/use-toast";
import { User, WorkTask } from "../types/authTypes";
import { transformProfileToUser } from "../utils/authUtils";

class ClientScheduleService {
  public async updateClientSchedule(clientId: string, schedule: User['schedule']): Promise<User | null> {
    try {
      const { data, error } = await db
        .from('user_profiles')
        .update({ schedule: JSON.stringify(schedule) })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error("Error updating client schedule:", error.message);
        toast({
          title: "Ошибка обновления",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return transformProfileToUser(data);
    } catch (error) {
      console.error("Error in updateClientSchedule:", error);
      return null;
    }
  }

  public async updateClientWorkTasks(clientId: string, workTasks: WorkTask[]): Promise<User | null> {
    try {
      const { data, error } = await db
        .from('user_profiles')
        .update({ work_tasks: JSON.stringify(workTasks) })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error("Error updating client work tasks:", error.message);
        toast({
          title: "Ошибка обновления",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return transformProfileToUser(data);
    } catch (error) {
      console.error("Error in updateClientWorkTasks:", error);
      return null;
    }
  }
}

export default new ClientScheduleService();
