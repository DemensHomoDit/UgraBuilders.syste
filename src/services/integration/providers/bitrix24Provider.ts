import { FormData, ContactFormData, ProjectConsultationData } from '../types/formTypes';
import { IntegrationProvider, IntegrationResult, ProviderStatus } from '../types/integrationProvider';
import { Bitrix24Config, Bitrix24LeadFields, FORM_TO_BITRIX24_ENTITY } from '../types/bitrix24Types';

/**
 * Провайдер для интеграции с Bitrix24 CRM
 */
class Bitrix24Provider implements IntegrationProvider {
  private config: Bitrix24Config;
  private apiBase: string;
  private lastStatus: ProviderStatus = { available: false };
  private lastStatusCheck: number = 0;
  private statusCheckInterval: number = 5 * 60 * 1000; // 5 минут

  constructor() {
    // Инициализация с вебхуком из конфигурации
    this.config = {
      webhookUrl: 'https://b24-o5g7wn.bitrix24.ru/rest/1/76gu1j4cwq1qcm7z/',
      timeout: 10000, // 10 секунд
      retry: {
        attempts: 3,
        delay: 1000
      }
    };
    this.apiBase = import.meta.env.VITE_API_BASE ?? '';
  }

  private useBackendProxy(): boolean {
    return true;
  }

  /**
   * Отправка данных формы в Bitrix24
   */
  async sendData(data: FormData): Promise<IntegrationResult> {
    try {
      // Проверяем, нужно ли отправлять этот тип формы в Bitrix24
      const entityType = FORM_TO_BITRIX24_ENTITY[data.formType];
      if (!entityType) {
        return {
          success: false,
          message: `Form type ${data.formType} is not supported for Bitrix24 integration`
        };
      }

      // В зависимости от типа сущности вызываем соответствующий метод
      if (entityType === 'lead') {
        return await this.createLead(data);
      }

      return {
        success: false,
        message: `Entity type ${entityType} is not implemented`
      };
    } catch (error) {
      console.error('Error sending data to Bitrix24:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Проверка статуса подключения к Bitrix24
   */
  async getStatus(): Promise<ProviderStatus> {
    const now = Date.now();
    
    // Если с момента последней проверки прошло мало времени, возвращаем кэшированный статус
    if (now - this.lastStatusCheck < this.statusCheckInterval) {
      return this.lastStatus;
    }

    try {
      // Проверяем статус, вызывая API метод
      const response = await this.callMethod('app.info', {});
      
      this.lastStatus = {
        available: true,
        message: 'Connected to Bitrix24',
        lastSync: new Date()
      };
    } catch (error) {
      this.lastStatus = {
        available: false,
        message: error instanceof Error ? error.message : 'Connection failed',
        lastSync: new Date()
      };
    }
    
    this.lastStatusCheck = now;
    return this.lastStatus;
  }

  /**
   * Создание лида в Bitrix24
   */
  private async createLead(data: FormData): Promise<IntegrationResult> {
    try {
      // Подготавливаем поля лида в зависимости от типа формы
      const fields = this.prepareLeadFields(data);
      
      // Вызываем API метод для создания лида
      const response = await this.callMethod('crm.lead.add', {
        fields: fields,
        params: { REGISTER_SONET_EVENT: 'Y' }
      });
      
      // Проверяем результат
      if (response && response.result > 0) {
        return {
          success: true,
          id: response.result.toString(),
          message: 'Lead created successfully',
          raw: response
        };
      } else {
        return {
          success: false,
          message: 'Failed to create lead, no ID returned',
          raw: response
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create lead',
      };
    }
  }

  /**
   * Подготовка полей лида в зависимости от типа формы
   */
  private prepareLeadFields(data: FormData): Bitrix24LeadFields {
    // Общие поля для всех типов форм
    const fields: Bitrix24LeadFields = {
      TITLE: `Заявка с сайта: ${data.formType}`,
      SOURCE_ID: 'WEB',
      COMMENTS: `Источник: ${data.source}`,
    };

    // Добавляем тему обращения в заголовок и комментарии
    if (data.topic) {
      fields.TITLE = `${fields.TITLE} - ${data.topic}`;
      fields.COMMENTS = `${fields.COMMENTS}\nТема обращения: ${data.topic}`;
      
      // Если выбрано "Другое" и указана произвольная тема
      if (data.customTopic) {
        fields.COMMENTS = `${fields.COMMENTS} (${data.customTopic})`;
      }
    }

    // Добавляем UTM-метки если они есть
    if (data.utm) {
      fields.UTM_SOURCE = data.utm.source;
      fields.UTM_MEDIUM = data.utm.medium;
      fields.UTM_CAMPAIGN = data.utm.campaign;
      fields.UTM_CONTENT = data.utm.content;
      fields.UTM_TERM = data.utm.term;
    }

    // В зависимости от типа формы добавляем специфичные поля
    switch (data.formType) {
      case 'contact':
        this.fillContactFormFields(fields, data as ContactFormData);
        break;
      case 'consultation':
        this.fillConsultationFormFields(fields, data as ProjectConsultationData);
        break;
      case 'callback':
        fields.TITLE = 'Заявка на обратный звонок';
        this.fillContactFormFields(fields, data as ContactFormData);
        break;
    }

    return fields;
  }

  /**
   * Заполнение полей лида данными из формы контактов
   */
  private fillContactFormFields(fields: Bitrix24LeadFields, data: ContactFormData): void {
    // Имя может быть в формате "Имя Фамилия" или просто "Имя"
    const nameParts = data.name.split(' ');
    fields.NAME = nameParts[0] || '';
    fields.LAST_NAME = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Добавляем email если он есть
    if (data.email) {
      fields.EMAIL = [{
        VALUE: data.email,
        VALUE_TYPE: 'WORK'
      }];
    }
    
    // Добавляем телефон если он есть
    if (data.phone) {
      fields.PHONE = [{
        VALUE: data.phone,
        VALUE_TYPE: 'WORK'
      }];
    }
    
    // Добавляем сообщение в комментарий - всегда, даже если оно уже есть в других местах
    if (data.message) {
      fields.COMMENTS = fields.COMMENTS + `\n\nСообщение клиента: ${data.message}`;
    }
  }

  /**
   * Заполнение полей лида данными из формы консультации по проекту
   */
  private fillConsultationFormFields(fields: Bitrix24LeadFields, data: ProjectConsultationData): void {
    // Сначала заполняем общие поля как в контактной форме
    this.fillContactFormFields(fields, {
      ...data,
      message: data.message || '',
    });
    
    // Устанавливаем заголовок с названием проекта
    fields.TITLE = `Консультация по проекту: ${data.projectTitle}`;
    
    // Добавляем информацию о проекте
    fields.COMMENTS = fields.COMMENTS + `\n\nИнформация о проекте:\nID: ${data.projectId}\nНазвание: ${data.projectTitle}`;
    
    // Можно добавить дополнительные поля если они поддерживаются в Bitrix24
    // fields['UF_CRM_CUSTOM_FIELD'] = data.projectId;
  }

  /**
   * Вызов метода Bitrix24 REST API
   */
  private async callMethod(method: string, data: any): Promise<any> {
    const methodPath = method.replace(/^\//, '');
    
    let attempts = 0;
    let lastError: Error | null = null;
    
    // Повторяем попытки согласно конфигурации
    while (attempts < (this.config.retry?.attempts || 1)) {
      attempts++;
      
      try {
        // Создаем Promise для таймаута
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeout || 10000);
        });
        
        // Создаем Promise для fetch запроса
        let fetchPromise: Promise<Response>;
        if (this.useBackendProxy()) {
          fetchPromise = fetch(`${this.apiBase}/api/bitrix/method`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ method: methodPath, payload: data }),
          });
        } else {
          fetchPromise = fetch(`${this.config.webhookUrl}${methodPath}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
        }

        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Bitrix24 API error (${response.status}): ${errorText}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Если это не последняя попытка, ждем перед следующей
        if (attempts < (this.config.retry?.attempts || 1)) {
          await new Promise(resolve => setTimeout(resolve, this.config.retry?.delay || 1000));
        }
      }
    }
    
    // Если все попытки неудачны, выбрасываем последнюю ошибку
    throw lastError || new Error('Failed to call Bitrix24 API after multiple attempts');
  }
}

export default Bitrix24Provider; 
