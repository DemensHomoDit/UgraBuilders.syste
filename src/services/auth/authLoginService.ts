import { db } from "@/integrations/db/client";
import { toast } from "@/components/ui/use-toast";
import type { User } from "../types/authTypes";
import { transformProfileToUser } from "../utils/authUtils";
import { withRetry } from "@/utils/retry";

class AuthLoginService {
  public async login(email: string, password: string): Promise<User | null> {
    return withRetry(async () => {
      try {
        const { data, error } = await db.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          throw error;
        }
        if (!data.user) {
          return null;
        }
        const { data: profileData, error: profileError } = await db
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        if (profileError) {
          throw profileError;
        }

        const { data: userData } = await db
          .from('users')
          .select('phone, avatar')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profileData) {
          const { data: newProfile, error: createProfileError } = await db
            .from('user_profiles')
            .insert({
              id: data.user.id,
              username: data.user.user_metadata.username || data.user.email?.split('@')[0] || 'user',
              role: 'client'
            })
            .select()
            .single();
          if (createProfileError) {
            throw createProfileError;
          }
          return { ...transformProfileToUser(newProfile), phone: userData?.phone || null, avatar: userData?.avatar || null };
        }
        return { ...transformProfileToUser(profileData), phone: userData?.phone || null, avatar: userData?.avatar || null };
      } catch (error) {
        throw error;
      }
    }, {
      onError: (error) => {
        toast({
          title: "Ошибка входа",
          description: error?.message || "Неизвестная ошибка",
          variant: "destructive",
        });
      }
    });
  }
}

export default new AuthLoginService();
