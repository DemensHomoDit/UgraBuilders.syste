
import { useState } from 'react';
import { getConnectionStatus } from '@/integrations/db/client';

export function useConnectionState() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [isConnected, setIsConnected] = useState<boolean>(getConnectionStatus());
  const [lastError, setLastError] = useState<string | null>(null);

  return {
    isOnline,
    setIsOnline,
    isReconnecting,
    setIsReconnecting,
    lastSyncTime,
    setLastSyncTime,
    isConnected,
    setIsConnected,
    lastError,
    setLastError
  };
}
