
import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
}

export function useToast() {
  const toast = (props: ToastProps) => {
    const { title, description, variant, duration, action } = props;
    
    // Если передан пустой title и description, это считается командой скрыть тост
    if ((title === '' && description === '') || !title) {
      return { id: 'dismiss' }; // Возвращаем фиктивный id для совместимости
    }
    
    // Исправляем проблему с вызовом метода toast
    let id;
    if (variant === "destructive") {
      id = sonnerToast.error(title, {
        description,
        duration,
        action
      });
    } else {
      id = sonnerToast(title, {
        description,
        duration,
        action
      });
    }
    
    return { id };
  };

  return { toast };
}

// Экспортируем toast функцию для использования без хука
export const toast = (props: ToastProps) => {
  const { title, description, variant, duration, action } = props;
  
  // Если передан пустой title и description, это считается командой скрыть тост
  if ((title === '' && description === '') || !title) {
    return { id: 'dismiss' }; // Возвращаем фиктивный id для совместимости
  }
  
  // Исправляем проблему с вызовом метода toast
  let id;
  if (variant === "destructive") {
    id = sonnerToast.error(title, {
      description,
      duration,
      action
    });
  } else {
    id = sonnerToast(title, {
      description,
      duration,
      action
    });
  }
  
  return { id };
};
