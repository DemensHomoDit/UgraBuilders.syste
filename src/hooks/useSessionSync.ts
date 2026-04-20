
import { useConnectionState } from './session/useConnectionState';
import { useConnectionEvents } from './session/useConnectionEvents';
import { useManualSync } from './session/useManualSync';
import type { UseSessionSyncReturn } from './session/types';

export function useSessionSync(): UseSessionSyncReturn {
  const {
    isOnline,
    isReconnecting,
    lastSyncTime,
    isConnected,
    lastError,
    setIsOnline,
    setIsReconnecting,
    setLastSyncTime,
    setIsConnected,
    setLastError
  } = useConnectionState();

  const actions = {
    setIsOnline,
    setIsReconnecting,
    setLastSyncTime,
    setIsConnected,
    setLastError
  };

  useConnectionEvents(actions);
  const manualSync = useManualSync(actions);

  return {
    isOnline,
    isReconnecting,
    lastSyncTime,
    isConnected,
    lastError,
    manualSync
  };
}

export default useSessionSync;
