import { db } from '@/integrations/db/client';

/**
 * Сервис для синхронизации данных между Bitrix24 и внутренней базой данных
 */
class SyncService {
  private bitrix24Webhook: string;

  constructor() {
    this.bitrix24Webhook = 'https://b24-o5g7wn.bitrix24.ru/rest/1/76gu1j4cwq1qcm7z/';
  }

  /**
   * Синхронизирует последние лиды из Bitrix24 с внутренней базой данных
   * @param limit Количество последних лидов для синхронизации
   */
  async syncLeadsFromBitrix24(limit: number = 50): Promise<{
    success: boolean;
    synced: number;
    errors: number;
    message: string;
  }> {
    try {
      // Получаем данные из Bitrix24
      const leadsData = await this.fetchLeadsFromBitrix24(limit);

      if (!leadsData || !Array.isArray(leadsData.result)) {
        throw new Error('Некорректный ответ от API Bitrix24');
      }

      const leads = leadsData.result;
      let syncedCount = 0;
      let errorCount = 0;

      // Обрабатываем каждый лид
      for (const lead of leads) {
        try {
          // Проверяем, существует ли уже такой лид
          const { data: existingLead } = await db
            .from('bitrix_leads')
            .select('*')
            .eq('lead_id', lead.ID)
            .single();

          // Подготавливаем данные лида
          const leadData = {
            lead_id: lead.ID,
            title: lead.TITLE || '',
            name: lead.NAME || '',
            last_name: lead.LAST_NAME || '',
            email: lead.EMAIL && lead.EMAIL[0] ? lead.EMAIL[0].VALUE : '',
            phone: lead.PHONE && lead.PHONE[0] ? lead.PHONE[0].VALUE : '',
            status_id: lead.STATUS_ID || '',
            source_id: lead.SOURCE_ID || '',
            raw_data: lead,
            last_sync: new Date().toISOString()
          };

          if (existingLead) {
            // Если лид уже существует, обновляем его
            const { error } = await db
              .from('bitrix_leads')
              .update(leadData)
              .eq('lead_id', lead.ID);

            if (error) throw new Error(`Ошибка обновления лида: ${error.message}`);
          } else {
            // Если лид новый, создаем запись
            const { error } = await db
              .from('bitrix_leads')
              .insert(leadData);

            if (error) throw new Error(`Ошибка создания лида: ${error.message}`);
          }

          syncedCount++;
        } catch (error) {
          console.error('Ошибка синхронизации лида:', error);
          errorCount++;
        }
      }

      return {
        success: true,
        synced: syncedCount,
        errors: errorCount,
        message: `Синхронизировано ${syncedCount} лидов, ошибок: ${errorCount}`
      };
    } catch (error) {
      console.error('Ошибка синхронизации лидов из Bitrix24:', error);
      return {
        success: false,
        synced: 0,
        errors: 1,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка синхронизации'
      };
    }
  }

  /**
   * Получает список последних лидов из Bitrix24
   * @param limit Количество лидов для получения
   */
  private async fetchLeadsFromBitrix24(limit: number = 50) {
    try {
      const response = await fetch(`${this.bitrix24Webhook}crm.lead.list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: { DATE_CREATE: 'DESC' },
          filter: {},
          select: [
            'ID', 'TITLE', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE',
            'STATUS_ID', 'SOURCE_ID', 'COMMENTS', 'DATE_CREATE',
            'ASSIGNED_BY_ID', 'OPPORTUNITY', 'CURRENCY_ID'
          ],
          start: 0,
          limit: limit
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
   * Получает подробную информацию о лиде из Bitrix24 по ID
   * @param leadId ID лида в Bitrix24
   */
  async getLeadById(leadId: string) {
    try {
      const response = await fetch(`${this.bitrix24Webhook}crm.lead.get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: leadId
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка API Bitrix24: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка получения лида ${leadId} из Bitrix24:`, error);
      throw error;
    }
  }

  /**
   * Получает список заявок из внутренней базы данных
   * с пагинацией и фильтрацией
   */
  async getFormSubmissions({
    page = 1,
    limit = 10,
    formType = null,
    status = null,
    startDate = null,
    endDate = null
  }: {
    page?: number;
    limit?: number;
    formType?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }) {
    try {
      let query = db
        .from('form_submissions')
        .select('*', { count: 'exact' });

      // Применяем фильтры
      if (formType) {
        query = query.eq('form_type', formType);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      // Применяем пагинацию
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Добавляем сортировку и пагинацию
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Ошибка получения заявок: ${error.message}`);
      }

      return {
        data,
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      };
    } catch (error) {
      console.error('Ошибка получения заявок из базы данных:', error);
      throw error;
    }
  }

  /**
   * Обновляет статус заявки во внутренней базе данных
   */
  async updateFormSubmissionStatus(id: string, status: string) {
    try {
      const { error } = await db
        .from('form_submissions')
        .update({
          status,
          processed: status !== 'new',
          processed_at: status !== 'new' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Ошибка обновления статуса заявки: ${error.message}`);
      }

      return {
        success: true,
        message: `Статус заявки успешно обновлен на "${status}"`
      };
    } catch (error) {
      console.error('Ошибка обновления статуса заявки:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Закрепить/открепить форму для менеджера
   * @param {string} formId - ID формы
   * @param {boolean} pinStatus - статус закрепления (true - закрепить, false - открепить)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async toggleFormPin(formId: string, pinStatus: boolean): Promise<{success: boolean, message: string}> {
    try {
      const { data, error } = await db
        .rpc('toggle_form_pin', {
          form_id: formId,
          pin_status: pinStatus
        });

      if (error) throw error;
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('Ошибка при изменении статуса закрепления формы:', error);
      return {
        success: false,
        message: 'Не удалось изменить статус закрепления формы'
      };
    }
  }

  /**
   * Связывает заявки из формы с лидами в Bitrix24 по email и телефону
   * Это позволит системе отображать все заявки из Bitrix24 в клиентском интерфейсе
   */
  async linkFormSubmissionsToBitrixLeads(): Promise<{
    success: boolean;
    linked: number;
    errors: number;
    message: string;
  }> {
    try {
      // Получаем все заявки из формы
      const { data: formSubmissions, error: formError } = await db
        .from('form_submissions')
        .select('*');
      
      if (formError) throw new Error(`Ошибка получения заявок: ${formError.message}`);
      
      // Получаем все лиды из Bitrix24
      const { data: bitrixLeads, error: bitrixError } = await db
        .from('bitrix_leads')
        .select('*');
      
      if (bitrixError) throw new Error(`Ошибка получения лидов: ${bitrixError.message}`);
      
      // Счетчики для отчета
      let linkedCount = 0;
      let errorCount = 0;
      
      // Обходим все заявки из форм
      for (const submission of formSubmissions || []) {
        try {
          const submissionEmail = submission.data?.email || '';
          const submissionPhone = submission.data?.phone || '';
          
          // Если нет контактных данных, пропускаем
          if (!submissionEmail && !submissionPhone) continue;
          
          // Ищем соответствующие лиды в Bitrix24
          const matchingLeads = (bitrixLeads || []).filter(lead => {
            const leadEmail = lead.email || '';
            const leadPhone = lead.phone || '';
            
            return (
              (submissionEmail && leadEmail && submissionEmail.toLowerCase() === leadEmail.toLowerCase()) || 
              (submissionPhone && leadPhone && submissionPhone.includes(leadPhone) || leadPhone.includes(submissionPhone))
            );
          });
          
          // Если нашли совпадения, создаем связь в таблице form_bitrix_links
          for (const lead of matchingLeads) {
            // Проверяем, существует ли уже такая связь
            const { data: existingLink, error: linkCheckError } = await db
              .from('form_bitrix_links')
              .select('*')
              .eq('form_id', submission.id)
              .eq('bitrix_id', lead.lead_id)
              .maybeSingle();
            
            if (linkCheckError) {
              console.error(`Ошибка проверки связи: ${linkCheckError.message}`);
              continue;
            }
            
            // Если связь не существует, создаем ее
            if (!existingLink) {
              const { error: insertError } = await db
                .from('form_bitrix_links')
                .insert({
                  form_id: submission.id,
                  bitrix_id: lead.lead_id,
                  linked_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error(`Ошибка создания связи: ${insertError.message}`);
                errorCount++;
              } else {
                linkedCount++;
              }
            }
          }
        } catch (error) {
          console.error('Ошибка при обработке заявки:', error);
          errorCount++;
        }
      }
      
      return {
        success: true,
        linked: linkedCount,
        errors: errorCount,
        message: `Связано ${linkedCount} заявок с лидами, ошибок: ${errorCount}`
      };
    } catch (error) {
      console.error('Ошибка связывания заявок с лидами:', error);
      return {
        success: false,
        linked: 0,
        errors: 1,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }
}

// Экспортируем singleton инстанс сервиса
export default new SyncService(); 