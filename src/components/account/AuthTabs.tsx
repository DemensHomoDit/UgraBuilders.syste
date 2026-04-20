
import { motion } from "framer-motion";
import LoginForm from "./LoginForm";

interface AuthTabsProps {
  onSuccessfulAuth: (user: any) => void;
}

const AuthTabs = ({ onSuccessfulAuth }: AuthTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-100"
    >
      <h2 className="text-xl font-semibold text-center mb-6">Вход в систему</h2>
      <LoginForm onSuccessfulLogin={onSuccessfulAuth} />
    </motion.div>
  );
};

export default AuthTabs;
