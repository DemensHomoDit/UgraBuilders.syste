
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
      setLastError("Потеряно соединение с Supabase");
    };

    const handleConnectionFailed = (event: CustomEvent) => {
      const errorMessage = event.detail?.message || "Неизвестная ошибка";
      setIsReconnecting(false);
      setIsConnected(false);
      setLastError(`Ошибка подключения к Supabase: ${errorMessage}`);
      toast.error("Ошибка подключения", {
        description: errorMessage
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('supabase:reconnected', handleReconnected as EventListener);
    window.addEventListener('supabase:disconnected', handleDisconnected as EventListener);
    window.addEventListener('supabase:connection-failed', handleConnectionFailed as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('supabase:reconnected', handleReconnected as EventListener);
      window.removeEventListener('supabase:disconnected', handleDisconnected as EventListener);
      window.removeEventListener('supabase:connection-failed', handleConnectionFailed as EventListener);
    };
  }, [setIsOnline, setIsReconnecting, setLastSyncTime, setIsConnected, setLastError]);
}
