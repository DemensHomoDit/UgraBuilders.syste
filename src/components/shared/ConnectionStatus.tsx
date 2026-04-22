
import React, { useState, useEffect } from 'react';
import { CheckCircle, WifiOff, AlertCircle } from 'lucide-react';
import { forceConnectionCheck, getConnectionStatus } from '@/integrations/db/client';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = "" }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    // Инициализация с текущим статусом
    setIsConnected(getConnectionStatus());
    
    // Проверка соединения при монтировании
    const checkConnection = async () => {
      setIsChecking(true);
      const status = await forceConnectionCheck();
      setIsConnected(status);
      setIsChecking(false);
    };
    
    checkConnection();
    
    // Подписка на события соединения
    const handleDisconnect = () => setIsConnected(false);
    const handleReconnect = () => setIsConnected(true);
    const handleConnectionFailed = () => setIsConnected(false);
    
    window.addEventListener('db:disconnected', handleDisconnect);
    window.addEventListener('db:reconnected', handleReconnect);
    window.addEventListener('db:connection-failed', handleConnectionFailed);
    
    return () => {
      window.removeEventListener('db:disconnected', handleDisconnect);
      window.removeEventListener('db:reconnected', handleReconnect);
      window.removeEventListener('db:connection-failed', handleConnectionFailed);
    };
  }, []);
  
  // Обработчик для проверки соединения
  const handleCheckConnection = async () => {
    setIsChecking(true);
    const status = await forceConnectionCheck(true);
    setIsConnected(status);
    setIsChecking(false);
  };
  
  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <CheckCircle size={16} />
        <span>Соединение установлено</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded bg-red-50 border border-red-200 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-red-600">
        <WifiOff size={16} />
        <span>Отсутствует соединение с базой данных</span>
      </div>
      <button 
        onClick={handleCheckConnection}
        disabled={isChecking}
        className="text-xs text-blue-600 hover:text-blue-800 disabled:text-blue-400"
      >
        {isChecking ? 'Проверка...' : 'Проверить соединение'}
      </button>
    </div>
  );
};

export default ConnectionStatus;
