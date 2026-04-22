
import { useEffect } from 'react';
import { forceConnectionCheck } from '@/integrations/db/client';
import { ConnectionStateActions } from './types';
import { toast } from 'sonner';

export function useConnectionEvents(actions: ConnectionStateActions) {
  const {
    setIsOnline,
    setIsReconnecting,
    setLastSyncTime,
    setIsConnected,
    setLastError
  } = actions;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(async () => {
        const isDbConnected = await forceConnectionCheck();
        setIsConnected(isDbConnected);
        if (!isDbConnected) {
          setLastError("БД недоступна, хотя сеть работает");
        } else {
          setLastError(null);
        }
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
      setLastError("Отсутствует подключение к сети");
    };

    const handleReconnected = () => {
      setIsReconnecting(false);
      setIsConnected(true);
      setLastSyncTime(Date.now());
      setLastError(null);
    };

    const handleDisconnected = () => {
      setIsReconnecting(true);
      setIsConnected(false);
      setLastError("Потеряно соединение с базой данных");
    };

    const handleConnectionFailed = (event: CustomEvent) => {
      const errorMessage = event.detail?.message || "Неизвестная ошибка";
      setIsReconnecting(false);
      setIsConnected(false);
      setLastError(`Ошибка подключения к базе данных: ${errorMessage}`);
      toast.error("Ошибка подключения", {
        description: errorMessage
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('db:reconnected', handleReconnected as EventListener);
    window.addEventListener('db:disconnected', handleDisconnected as EventListener);
    window.addEventListener('db:connection-failed', handleConnectionFailed as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('db:reconnected', handleReconnected as EventListener);
      window.removeEventListener('db:disconnected', handleDisconnected as EventListener);
      window.removeEventListener('db:connection-failed', handleConnectionFailed as EventListener);
    };
  }, [setIsOnline, setIsReconnecting, setLastSyncTime, setIsConnected, setLastError]);
}
