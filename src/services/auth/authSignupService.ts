import { db } from "@/integrations/db/client";
import { toast } from "@/components/ui/use-toast";
import type { User } from "../types/authTypes";
import { transformProfileToUser } from "../utils/authUtils";
import { withRetry } from "@/utils/retry";

class AuthSignupService {
  public async signup(email: string, password: string, username: string): Promise<User | null> {
    return withRetry(async () => {
      try {
        try {
          const { data: existingUsers } = await db
            .from('user_profiles')
            .select('id')
            .eq('username', username)
            .limit(1);
          if (existingUsers && existingUsers.length > 0) {
            throw new Error("Пользователь с таким именем уже существует");
          }
        } catch (error) {
          // Ignore - will proceed with signup
        }
        const { data, error } = await db.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        });
        if (error) {
          throw error;
        }
        if (!data.user) {
          throw new Error("No user data returned after signup");
        }
        if (data.session) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: profileData, error: profileCheckError } = await db
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          if (profileCheckError) {
            throw profileCheckError;
          }
          if (profileData) {
            toast({
              title: "Регистрация успешна",
              description: "Вы успешно зарегистрировались",
            });
            const { data: userData } = await db.from('users').select('phone, avatar').eq('id', data.user.id).maybeSingle();
            return { ...transformProfileToUser(profileData), phone: userData?.phone || null, avatar: userData?.avatar || null };
          }
          const { data: manualProfile, error: manualProfileError } = await db
            .from('user_profiles')
            .insert({
              id: data.user.id,
              username,
              role: 'client'
            })
            .select()
            .single();
          if (manualProfileError) {
            toast({
              title: "Регистрация успешна",
              description: "Регистрация завершена, но возникли проблемы с созданием профиля",
            });
            return {
              id: data.user.id,
              username,
              email: data.user.email || '',
              role: 'client'
            };
          }
          toast({
            title: "Регистрация успешна",
            description: "Вы успешно зарегистрировались",
          });
          return transformProfileToUser(manualProfile);
        } else {
          toast({
            title: "Регистрация в процессе",
            description: "Пожалуйста, подтвердите вашу электронную почту, чтобы завершить регистрацию",
          });
          const { data: manualProfile, error: manualProfileError } = await db
            .from('user_profiles')
            .insert({
              id: data.user.id,
              username,
              role: 'client'
            })
            .select()
            .single();
          return {
            id: data.user.id,
            username,
            email: data.user.email || '',
            role: 'client'
          };
        }
      } catch (error) {
        throw error;
      }
    }, {
      onError: (error) => {
        toast({
          title: "Ошибка регистрации",
          description: error?.message || "Неизвестная ошибка",
          variant: "destructive",
        });
      }
    });
  }
}

export default new AuthSignupService();
