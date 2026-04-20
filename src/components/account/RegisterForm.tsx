import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import authService from "@/services/authService";
import { motion } from "framer-motion";

interface RegisterFormProps {
  onSuccessfulRegistration: (user: any) => void;
}

const RegisterForm = ({ onSuccessfulRegistration }: RegisterFormProps) => {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!registerEmail || !registerPassword || !registerUsername) {
      toast({
        title: "Ошибка регистрации",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Ошибка регистрации",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signup(registerEmail, registerPassword, registerUsername);
      
      if (user) {
        if (user.id) {
          onSuccessfulRegistration(user);
          toast({
            title: "Регистрация успешна",
            description: "Вы успешно зарегистрировались",
          });
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error) {
        setAuthError(error.message);
        toast({
          title: "Ошибка регистрации",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAuthError("Произошла неизвестная ошибка");
        toast({
          title: "Ошибка регистрации",
          description: "Произошла ошибка при регистрации",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSignup} 
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
        <Label htmlFor="registerUsername" className="text-gray-700">Имя пользователя</Label>
        <Input
          id="registerUsername"
          type="text"
          value={registerUsername}
          onChange={(e) => setRegisterUsername(e.target.value)}
          placeholder="Введите ваше имя"
          className="focus:ring-primary focus:border-primary transition-all duration-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="registerEmail" className="text-gray-700">Email</Label>
        <Input
          id="registerEmail"
          type="email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          placeholder="Введите ваш email"
          className="focus:ring-primary focus:border-primary transition-all duration-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="registerPassword" className="text-gray-700">Пароль</Label>
        <div className="relative">
          <Input
            id="registerPassword"
            type={showRegisterPassword ? "text" : "password"}
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder="Введите ваш пароль"
            className="focus:ring-primary focus:border-primary transition-all duration-200"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setShowRegisterPassword(!showRegisterPassword);
            }}
          >
            {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Минимум 6 символов</p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6 transform hover:scale-[1.02] transition-all duration-200"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
            Регистрация...
          </span>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Зарегистрироваться
          </>
        )}
      </Button>
    </motion.form>
  );
};

export default RegisterForm;
