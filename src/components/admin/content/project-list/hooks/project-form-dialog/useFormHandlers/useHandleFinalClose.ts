
import { useCallback } from "react";
import { toast } from "sonner";

export function useHandleFinalClose(
  onClose: () => void,
  preventClose: boolean,
  isImageDialogOpen: boolean
) {
  return useCallback(() => {
    console.debug("Final close called", {
      preventClose,
      isImageDialogOpen
    });

    if (preventClose || isImageDialogOpen) {
      toast.info("Дождитесь завершения текущей операции");
      return;
    }

    onClose();
  }, [onClose, preventClose, isImageDialogOpen]);
}
