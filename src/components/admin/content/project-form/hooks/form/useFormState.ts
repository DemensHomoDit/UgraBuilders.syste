
import { useRef, useEffect } from "react";
import { Project } from "@/types/project";

export const useFormState = (initialProject?: Project) => {
  // Реф для отслеживания состояния монтирования компонента
  const isMountedRef = useRef<boolean>(true);
  
  // Устанавливаем флаг монтирования при монтировании и размонтировании компонента
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, [initialProject?.id]);
  
  return {
    isMountedRef
  };
};
