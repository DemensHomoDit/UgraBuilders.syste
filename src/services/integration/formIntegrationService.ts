import { FormData } from './types/formTypes';
import { IntegrationProvider, IntegrationResult } from './types/integrationProvider';
import ContactFormAdapter from './adapters/contactFormAdapter';
import ProjectConsultationAdapter from './adapters/projectConsultationAdapter';
import CommentFormAdapter from './adapters/commentFormAdapter';
import Bitrix24Provider from './providers/bitrix24Provider';
import InternalSystemProvider from './providers/internalSystemProvider';

/**
 * Сервис интеграции форм с внешними системами
 * Предоставляет единый интерфейс для отправки данных форм в Bitrix24 и внутреннюю систему
 */
class FormIntegrationService {
  private bitrix24Provider: IntegrationProvider;
  private internalSystemProvider: IntegrationProvider;
  private adapters: {[key: string]: any};
  
  constructor() {
    // Инициализация провайдеров
    this.bitrix24Provider = new Bitrix24Provider();
    this.internalSystemProvider = new InternalSystemProvider();
    
    // Инициализация адаптеров для разных типов форм
    this.adapters = {
      contact: new ContactFormAdapter(),
      consultation: new ProjectConsultationAdapter(),
      comment: new CommentFormAdapter()
    };
  }
  
  /**
   * Обработка данных формы и отправка во все системы
   * @param formType Тип формы ('contact', 'consultation', 'comment', 'callback')
   * @param data Данные формы
   * @returns Результаты отправки в разные системы
   */
  async processFormData(formType: string, data: any): Promise<{
    bitrix24: IntegrationResult,
    internalSystem: IntegrationResult
  }> {
    try {
      // Получаем адаптер для соответствующего типа формы
      const adapter = this.adapters[formType];
      if (!adapter) {
        throw new Error(`Adapter for form type "${formType}" not found`);
      }
      
      // Адаптируем данные для отправки
      const adaptedData = adapter.adapt(data);
      
      // Отправляем данные во все системы параллельно
      const [bitrix24Result, internalSystemResult] = await Promise.all([
        this.bitrix24Provider.sendData(adaptedData),
        this.internalSystemProvider.sendData(adaptedData)
      ]);
      
      // Записываем результат в лог
      this.logIntegrationResult(formType, adaptedData, {
        bitrix24: bitrix24Result,
        internalSystem: internalSystemResult
      });
      
      return {
        bitrix24: bitrix24Result,
        internalSystem: internalSystemResult
      };
    } catch (error) {
      console.error('Error in form integration:', error);
      
      const failedResult: IntegrationResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
      
      return {
        bitrix24: failedResult,
        internalSystem: failedResult
      };
    }
  }
  
  /**
   * Проверка статуса всех провайдеров
   * @returns Статус доступности провайдеров
   */
  async checkProvidersStatus(): Promise<{
    bitrix24: boolean,
    internalSystem: boolean
  }> {
    try {
      const [bitrix24Status, internalSystemStatus] = await Promise.all([
        this.bitrix24Provider.getStatus(),
        this.internalSystemProvider.getStatus()
      ]);
      
      return {
        bitrix24: bitrix24Status.available,
        internalSystem: internalSystemStatus.available
      };
    } catch (error) {
      console.error('Error checking providers status:', error);
      return {
        bitrix24: false,
        internalSystem: false
      };
    }
  }
  
  /**
   * Логирование результатов интеграции
   * @param formType Тип формы
   * @param data Данные формы
   * @param results Результаты отправки
   */
  private logIntegrationResult(formType: string, data: FormData, results: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      formType,
      sourceUrl: data.source,
      results
    };
    // В реальной системе здесь будет сохранение в БД или отправка в систему мониторинга
  }
}

// Экспортируем singleton инстанс сервиса
export default new FormIntegrationService(); 