import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/integrations/db/client";
import { useToast } from "@/components/ui/use-toast";
import { safeJsonParse } from "@/services/utils/authUtils";

// Определяем тип для статуса задачи
export type TaskStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "planned"
  | "delayed";

// Определяем и экспортируем интерфейс для структуры данных профиля
interface ProfileData {
  username?: string | null;
  role?: string | null;
  folders?: any;
  project_stats?: any;
  client_stage?: string | null;
}

// Экспортируем типы
export interface ProjectStats {
  total?: number;
  completed?: number;
  inProgress?: number;
  planned?: number;
  totalArea?: number;
  completedArea?: number;
  materialsUsed?: number;
  workHours?: number;
  startDate?: string;
  estimatedEndDate?: string;
  actualEndDate?: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  phone?: string | null;
  avatar?: string | null;
  clientStage?: string | null;
  folders?: {
    photos: any[];
    documents: any[];
    contracts: any[];
  };
  projectStats?: ProjectStats;
}

export const useAuth = () => {
  // Определяем все refs в начале
  const subscriptionRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Затем useState
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");

  // Затем хуки
  const { toast } = useToast();

  // Функция для получения профиля пользователя
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<ProfileData | null> => {
      try {
        const { data: profileData, error: profileError } = await db
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        return profileData as ProfileData;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [],
  );

  const fetchUserFields = useCallback(
    async (userId: string): Promise<{ phone: string | null; avatar: string | null }> => {
      try {
        const { data, error } = await db
          .from("users")
          .select("phone, avatar")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("User fields fetch error:", error);
          return { phone: null, avatar: null };
        }

        return {
          phone: data?.phone || null,
          avatar: data?.avatar || null,
        };
      } catch (error) {
        console.error("Error fetching user fields:", error);
        return { phone: null, avatar: null };
      }
    },
    [],
  );

  // Функция для синхронизации состояния аутентификации
  const syncAuthState = useCallback(
    async (forceUserUpdate = false) => {
      try {
        if (!forceUserUpdate) {
          setLoading(true);
        }
        setError(null);
        setConnectionStatus("connecting");

        // Используем метод, который обновляет сессию с сервера
        const {
          data: { session },
          error: sessionError,
        } = await db.auth.getSession();

        if (sessionError) {
          console.error("Session error during sync:", sessionError);
          setConnectionStatus("disconnected");
          throw sessionError;
        }

        setConnectionStatus("connected");

        if (session?.user) {
          try {
            const [profileData, userFields] = await Promise.all([
              fetchUserProfile(session.user.id),
              fetchUserFields(session.user.id),
            ]);

            if (profileData) {
              const emptyFolders = { photos: [], documents: [], contracts: [] };

              const updatedUser: User = {
                id: session.user.id,
                email: session.user.email || "",
                username:
                  profileData?.username ||
                  session.user.email?.split("@")[0] ||
                  "user",
                role: profileData?.role || "client",
                phone: userFields.phone,
                avatar: userFields.avatar,
                clientStage: profileData.client_stage,
                folders: safeJsonParse(profileData.folders, emptyFolders),
                projectStats: safeJsonParse(
                  profileData.project_stats,
                  undefined as unknown as ProjectStats,
                ),
              };

              setUser(updatedUser);
            } else if (!profileData && forceUserUpdate) {
              console.warn(
                "No profile data found during sync, using session data only",
              );
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                username: session.user.email?.split("@")[0] || "user",
                role: "client",
                schedule: [],
              });
            } else if (user && !forceUserUpdate) {
              // Если у нас уже есть данные о пользователе и это не принудительное обновление,
              // сохраняем текущее состояние
            } else {
              console.warn("No profile data found, using default values");
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                username: session.user.email?.split("@")[0] || "user",
                role: "client",
                schedule: [],
              });
            }
          } catch (error) {
            console.error("Error processing profile during sync:", error);
            if (forceUserUpdate || !user) {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                username: session.user.email?.split("@")[0] || "user",
                role: "client",
                schedule: [],
              });
              setError(
                "Не удалось загрузить профиль полностью. Некоторые функции могут быть недоступны.",
              );
            }
          }
        } else if (forceUserUpdate || !user) {
          // Только сбрасываем пользователя, если это принудительное обновление
          // или у нас нет текущего пользователя
          setUser(null);
        }
      } catch (error) {
        console.error("Error in auth sync process:", error);
        setError(
          "Не удалось синхронизировать данные профиля. Попробуйте обновить страницу.",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchUserProfile, fetchUserFields, user],
  );

  // Настройка подписки на изменения аутентификации
  const setupAuthSubscription = useCallback(() => {
    // Очищаем предыдущую подписку если она существует
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    // Устанавливаем новую подписку
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        syncAuthState(true);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "INITIAL_SESSION") {
        // Handled by syncAuthState above
      }
    });

    // Сохраняем ссылку на подписку
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [syncAuthState]);

  // Периодический пинг базы данных для поддержания соединения
  const setupDatabasePing = useCallback(() => {
    // Функция пинга, которая выполняет легкий запрос для проверки соединения
    const pingDatabase = async () => {
      try {
        const { count, error } = await db
          .from("user_profiles")
          .select("*", { count: "exact", head: true });

        if (error) {
          setConnectionStatus("disconnected");
        } else {
          setConnectionStatus("connected");
        }
      } catch (error) {
        setConnectionStatus("disconnected");
      }
    };

    // Начальный пинг
    pingDatabase();

    // Очищаем предыдущий интервал если он существует
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    // Устанавливаем интервал пинга (5 минут)
    pingIntervalRef.current = setInterval(pingDatabase, 5 * 60 * 1000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, []);

  // Инициализация при монтировании
  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;

    // Синхронизируем состояние при первичной загрузке
    syncAuthState(true);

    // Устанавливаем подписку на изменения аутентификации
    const cleanupAuthSubscription = setupAuthSubscription();

    // Настраиваем периодический пинг базы данных
    const cleanupDatabasePing = setupDatabasePing();

    // Добавляем обработчики событий видимости страницы для фонового обновления
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Выполняем фоновую синхронизацию без принудительного обновления UI
        syncAuthState(false);
      }
    };

    // Добавляем обработчики фокуса окна
    const handleFocus = () => {
      // Фоновое обновление при получении фокуса
      syncAuthState(false);
    };

    // Регистрируем обработчики событий
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Очистка при размонтировании
    return () => {
      cleanupAuthSubscription();
      cleanupDatabasePing();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [syncAuthState, setupAuthSubscription, setupDatabasePing]);

  const logout = async () => {
    try {
      // Важное изменение: Явно указываем, что нужно стереть сессию локально
      const { error } = await db.auth.signOut({ scope: "local" });
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Ошибка выхода",
        description: "Произошла ошибка при выходе из системы",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return {
    user,
    loading,
    error,
    logout,
    syncUserData: () => syncAuthState(true),
    isConnected: connectionStatus === "connected",
  };
};
