import { FormData } from '../types/formTypes';
import { IntegrationProvider, IntegrationResult, ProviderStatus } from '../types/integrationProvider';
import { db } from '@/integrations/db/client';

/**
 * Провайдер для интеграции с внутренней системой компании
 * Получает данные из Bitrix24 и сохраняет их в базу данных Supabase
 */
class InternalSystemProvider implements IntegrationProvider {
  private bitrix24Webhook: string;
  private lastStatus: ProviderStatus = { available: false };
  private lastStatusCheck: number = 0;
  private statusCheckInterval: number = 5 * 60 * 1000; // 5 минут

  constructor() {
    // Используем тот же вебхук, что и для Bitrix24Provider
    this.bitrix24Webhook = 'https://b24-o5g7wn.bitrix24.ru/rest/1/76gu1j4cwq1qcm7z/';
  }

  /**
   * Отправка данных формы во внутреннюю систему
   * Фактически, сначала получает данные из Bitrix24, а затем сохраняет их в Supabase
   */
  async sendData(data: FormData): Promise<IntegrationResult> {
    try {
      // Сохраняем данные формы в таблицу form_submissions
      const { error: formError, data: formResult } = await db
        .from('form_submissions')
        .insert({
          form_type: data.formType,
          topic: data.topic,
          custom_topic: data.customTopic || null,
          source: data.source,
          data: data, // сохраняем все данные как JSON
          created_at: new Date().toISOString()
        })
        .select('id');

      if (formError) throw new Error(`Ошибка сохранения данных формы: ${formError.message}`);

      // Получаем ID созданной записи
      const insertRows = Array.isArray(formResult) ? formResult : (formResult ? [formResult] : []);
      const formId = insertRows[0]?.id;

      if (!formId) throw new Error('Не удалось получить ID созданной записи');

      // Если это форма консультации по проекту, получаем данные о проекте из Bitrix24
      // и сохраняем связь между проектом и заявкой
      if (data.formType === 'consultation' && 'projectId' in data) {
        try {
          // Получаем данные о лидах из Bitrix24 для дополнительной синхронизации
          // Вызываем Bitrix24 API для получения последних лидов
          const bitrixData = await this.fetchLeadsFromBitrix24();
          
          // Сохраняем полученные данные в таблицу bitrix_leads в Supabase
          if (bitrixData && Array.isArray(bitrixData.result)) {
            const { error: bitrixError } = await db
              .from('bitrix_leads')
              .insert(
                bitrixData.result.map(lead => ({
                  lead_id: lead.ID,
                  title: lead.TITLE,
                  name: lead.NAME,
                  last_name: lead.LAST_NAME,
                  email: lead.EMAIL && lead.EMAIL[0] ? lead.EMAIL[0].VALUE : null,
                  phone: lead.PHONE && lead.PHONE[0] ? lead.PHONE[0].VALUE : null,
                  status_id: lead.STATUS_ID,
                  source_id: lead.SOURCE_ID,
                  created_at: new Date().toISOString(),
                  raw_data: lead
                }))
              );

            if (bitrixError) {
              console.error('Ошибка сохранения данных из Bitrix24:', bitrixError);
            }
          }

          // Сохраняем связь проекта с заявкой
          const projectId = (data as any).projectId;
          if (projectId) {
            const { error: linkError } = await db
              .from('project_form_links')
              .insert({
                project_id: projectId,
                form_id: formId,
                created_at: new Date().toISOString()
              });

            if (linkError) {
              console.error('Ошибка при связывании проекта с заявкой:', linkError);
            }
          }
        } catch (bitrixError) {
          console.error('Ошибка при получении данных из Bitrix24:', bitrixError);
          // Не прерываем выполнение, так как основные данные уже сохранены
        }
      }

      return {
        success: true,
        id: formId.toString(),
        message: 'Данные успешно сохранены во внутреннюю систему',
      };
    } catch (error) {
      console.error('Ошибка при сохранении данных во внутреннюю систему:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Получение данных о лидах из Bitrix24
   */
  private async fetchLeadsFromBitrix24() {
    try {
      // Для получения последних 10 лидов
      const response = await fetch(`${this.bitrix24Webhook}crm.lead.list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: { DATE_CREATE: 'DESC' },
          filter: { },
          select: ['ID', 'TITLE', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'STATUS_ID', 'SOURCE_ID', 'COMMENTS'],
          start: 0,
          limit: 10
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка API Bitrix24: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении данных из Bitrix24:', error);
      throw error;
    }
  }

  /**
   * Проверка статуса подключения к внутренней системе
   */
  async getStatus(): Promise<ProviderStatus> {
    const now = Date.now();
    
    // Если с момента последней проверки прошло мало времени, возвращаем кэшированный статус
    if (now - this.lastStatusCheck < this.statusCheckInterval) {
      return this.lastStatus;
    }

    try {
      // Проверяем статус подключения к Supabase
      const { error } = await db.from('form_submissions').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Ошибка подключения к базе данных: ${error.message}`);
      }

      // Проверяем также статус подключения к Bitrix24
      const bitrix24Response = await fetch(`${this.bitrix24Webhook}app.info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!bitrix24Response.ok) {
        throw new Error(`Ошибка подключения к Bitrix24: ${bitrix24Response.status}`);
      }

      this.lastStatus = {
        available: true,
        message: 'Подключение к внутренней системе и Bitrix24 активно',
        lastSync: new Date()
      };
    } catch (error) {
      this.lastStatus = {
        available: false,
        message: error instanceof Error ? error.message : 'Ошибка подключения',
        lastSync: new Date()
      };
    }
    
    this.lastStatusCheck = now;
    return this.lastStatus;
  }
}

export default InternalSystemProvider; 
