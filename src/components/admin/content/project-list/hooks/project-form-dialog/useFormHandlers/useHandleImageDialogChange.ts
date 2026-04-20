
import { useCallback } from "react";

export function useHandleImageDialogChange(
  safeSetState: <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: React.SetStateAction<T>) => void,
  setIsImageDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  return useCallback((open: boolean) => {
    // управление открытием диалога с изображениями
    console.debug("Image dialog state change:", open);
    safeSetState(setIsImageDialogOpen, open);
  }, [safeSetState, setIsImageDialogOpen]);
}
