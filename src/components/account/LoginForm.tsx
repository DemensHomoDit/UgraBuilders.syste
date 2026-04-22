import { useState, useEffect } from "react";
import { Eye, EyeOff, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import authService from "@/services/authService";
import { motion } from "framer-motion";
import { db } from "@/integrations/db/client";
import { User, ProjectStats } from "@/services/types/authTypes";
import { safeJsonParse } from "@/services/utils/authUtils";

interface LoginFormProps {
  onSuccessfulLogin: (user: any) => void;
}

const LoginForm = ({ onSuccessfulLogin }: LoginFormProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Проверяем сессию при загрузке компонента
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await db.auth.getSession();

        if (error) {
          console.error("Ошибка при проверке сессии:", error);
          return;
        }
        if (data.session?.user) {
          const { data: profileData, error: profileError } = await db
            .from("user_profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Ошибка при получении профиля:", profileError);
            return;
          }

          if (profileData) {
            // Корректно обрабатываем данные профиля
            const emptyFolders = { photos: [], documents: [], contracts: [] };

            const { data: userData } = await db
              .from("users")
              .select("phone, avatar")
              .eq("id", data.session.user.id)
              .maybeSingle();

            const user: User = {
              id: data.session.user.id,
              email: data.session.user.email || "",
              username:
                profileData.username ||
                data.session.user.email?.split("@")[0] ||
                "user",
              role: profileData.role || "client",
              phone: userData?.phone || null,
              avatar: userData?.avatar || null,
              clientStage: profileData.client_stage,
              folders: safeJsonParse(profileData.folders, emptyFolders),
              projectStats: safeJsonParse(
                profileData.project_stats,
                undefined as unknown as ProjectStats,
              ),
            };

            onSuccessfulLogin(user);
          } else {
            const basicUser = {
              id: data.session.user.id,
              email: data.session.user.email || "",
              username: data.session.user.email?.split("@")[0] || "user",
              role: "client",
            };
            onSuccessfulLogin(basicUser);
          }
        }
      } catch (error) {
        console.error("Непредвиденная ошибка при проверке сессии:", error);
      }
    };

    checkSession();
  }, [onSuccessfulLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginEmail || !loginPassword) {
      toast({
        title: "Ошибка входа",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(loginEmail, loginPassword);

      if (user) {
        // Проверяем, есть ли сохраненный URL для перенаправления
        const redirectUrl = sessionStorage.getItem("redirect_after_login");
        if (redirectUrl) {
          sessionStorage.removeItem("redirect_after_login");
          window.location.href = redirectUrl; // Используем location для полной перезагрузки
        } else {
          onSuccessfulLogin(user);
          toast({
            title: "Успешный вход",
            description: "Вы успешно вошли в личный кабинет",
          });
        }
      } else {
        setAuthError("Неверный email или пароль");
        toast({
          title: "Ошибка входа",
          description: "Неверный email или пароль",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка входа:", error);
      setAuthError("Произошла ошибка при входе");
      toast({
        title: "Ошибка входа",
        description: "Произошла ошибка при входе",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleLogin}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {authError && (
        <motion.div
          className="mb-4 p-3 text-sm rounded-md bg-red-50 text-red-700 border border-red-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {authError}
        </motion.div>
      )}

      <div className="space-y-2">
        <Label htmlFor="loginEmail" className="text-gray-700">
          Email
        </Label>
        <Input
          id="loginEmail"
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="Введите ваш email"
          className="focus:ring-primary focus:border-primary transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loginPassword" className="text-gray-700">
          Пароль
        </Label>
        <div className="relative">
          <Input
            id="loginPassword"
            type={showLoginPassword ? "text" : "password"}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Введите ваш пароль"
            className="focus:ring-primary focus:border-primary transition-all duration-200"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setShowLoginPassword(!showLoginPassword);
            }}
          >
            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-6 transform hover:scale-[1.02] transition-all duration-200"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
            Вход...
          </span>
        ) : (
          <>
            <UserRound className="mr-2 h-4 w-4" />
            Войти
          </>
        )}
      </Button>
    </motion.form>
  );
};

export default LoginForm;
