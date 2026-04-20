import { FormData } from './formTypes';

// Базовый интерфейс для провайдеров интеграции
export interface IntegrationProvider {
  // Метод для отправки данных в целевую систему
  sendData(data: FormData): Promise<IntegrationResult>;
  
  // Получение статуса интеграции
  getStatus(): Promise<ProviderStatus>;
}

// Результат интеграции
export interface IntegrationResult {
  success: boolean;
  id?: string; // ID созданной записи в целевой системе
  message?: string; // Сообщение об успехе или ошибке
  raw?: any; // Исходный ответ от API
}

// Статус провайдера
export interface ProviderStatus {
  available: boolean;
  message?: string;
  lastSync?: Date;
} 