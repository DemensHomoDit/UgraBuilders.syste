
export interface ConnectionStateActions {
  setIsOnline: (value: boolean) => void;
  setIsReconnecting: (value: boolean) => void;
  setLastSyncTime: (value: number) => void;
  setIsConnected: (value: boolean) => void;
  setLastError: (value: string | null) => void;
}

export interface UseSessionSyncReturn {
  isOnline: boolean;
  isReconnecting: boolean;
  lastSyncTime: number;
  isConnected: boolean;
  lastError: string | null;
  manualSync: () => Promise<boolean>;
}
