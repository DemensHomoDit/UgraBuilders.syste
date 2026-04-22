
import { db } from "@/integrations/db/client";
import type { User } from "../types/authTypes";
import { transformProfileToUser } from "../utils/authUtils";

class AuthCurrentUserService {
  public async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await db.auth.getUser();
      
      if (error || !data.user) {
        return null;
      }

      const [profileResult, userResult] = await Promise.all([
        db.from('user_profiles').select('*').eq('id', data.user.id).maybeSingle(),
        db.from('users').select('phone, avatar').eq('id', data.user.id).maybeSingle(),
      ]);

      if (profileResult.error) {
        console.error("Profile fetch error:", profileResult.error.message);
        return null;
      }

      const profileData = profileResult.data;
      const userData = userResult.data;

      if (!profileData) {
        const { data: newProfile, error: createProfileError } = await db
          .from('user_profiles')
          .insert({
            id: data.user.id,
            username: data.user.user_metadata.username || data.user.phone?.split('+')[1] || 'user',
            role: 'client'
          })
          .select()
          .single();
          
        if (createProfileError) {
          console.error("Profile creation error for current user:", createProfileError.message);
          return {
            id: data.user.id,
            username: data.user.user_metadata.username || data.user.phone?.split('+')[1] || 'user',
            email: data.user.email || '',
            role: 'client'
          };
        }
        return { ...transformProfileToUser(newProfile), phone: userData?.phone || null, avatar: userData?.avatar || null };
      }
      return { ...transformProfileToUser(profileData), phone: userData?.phone || null, avatar: userData?.avatar || null };
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
}

export default new AuthCurrentUserService();
