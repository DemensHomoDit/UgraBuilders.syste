
import { useCallback } from 'react';
import { forceConnectionCheck, db } from '@/integrations/db/client';
import { toast } from 'sonner';
import { ConnectionStateActions } from './types';

export function useManualSync(actions: ConnectionStateActions) {
  const {
    setIsReconnecting,
    setLastSyncTime,
    setIsConnected,
    setLastError
  } = actions;

  return useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.onLine) {
        setLastError("Отсутствует сетевое подключение");
        toast.error("Сеть недоступна", {
          description: "Проверьте подключение к интернету"
        });
        return false;
      }

      setIsReconnecting(true);
      setLastError(null);

      const isDbConnected = await forceConnectionCheck();
      
      if (!isDbConnected) {
        setLastError("Не удалось подключиться к базе данных");
        setIsConnected(false);
        return false;
      }

      const { error: sessionError } = await db.auth.getSession();
      
      if (sessionError) {
        setLastError(`Ошибка сессии: ${sessionError.message}`);
        setIsReconnecting(false);
        setIsConnected(false);
        return false;
      }

      setIsConnected(true);
      setLastError(null);
      setLastSyncTime(Date.now());
      setIsReconnecting(false);
      return true;
    } catch (error: any) {
      setLastError(`Ошибка синхронизации: ${error.message || "Неизвестная ошибка"}`);
      setIsReconnecting(false);
      setIsConnected(false);
      return false;
    }
  }, [setIsReconnecting, setLastSyncTime, setIsConnected, setLastError]);
}
