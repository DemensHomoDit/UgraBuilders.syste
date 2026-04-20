
import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Обработчик изменения открытости диалога
 */
export function useHandleOpenChange(
  preventClose: boolean,
  isImageDialogOpen: boolean
) {
  return useCallback((open: boolean) => {
    console.debug("Dialog open state change requested:", open, {
      preventClose,
      isImageDialogOpen
    });

    // Предотвращаем закрытие диалога во время операций
    if (!open && (preventClose || isImageDialogOpen)) {
      console.debug("Preventing dialog close during operations");
      toast.info("Дождитесь завершения текущей операции");
      return;
    }
  }, [preventClose, isImageDialogOpen]);
}
