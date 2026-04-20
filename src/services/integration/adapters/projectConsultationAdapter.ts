import { FormData, ProjectConsultationData, FORM_TOPICS } from '../types/formTypes';

/**
 * Адаптер для формы консультации по проекту
 * Преобразует данные формы в формат, подходящий для отправки в CRM
 */
class ProjectConsultationAdapter {
  /**
   * Адаптирует данные формы консультации по проекту в общий формат для интеграции
   * @param data Исходные данные формы
   * @returns Адаптированные данные
   */
  adapt(data: any): ProjectConsultationData {
    // Получаем текущую страницу как источник
    const source = typeof window !== 'undefined' ? 
      window.location.href : 
      data.source || 'unknown';
    
    // Получаем UTM-метки из URL или данных
    const utm = this.extractUtmParams();
    
    // Определяем тему обращения (для консультации по проекту по умолчанию "Заказать индивидуальный проект")
    const topic = data.topic || FORM_TOPICS.CUSTOM_PROJECT;
    
    // Формируем структуру данных
    const result: ProjectConsultationData = {
      timestamp: Date.now(),
      source: source,
      formType: 'consultation',
      topic: topic,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      message: data.message || '',
      projectId: data.projectId || '',
      projectTitle: data.projectTitle || 'Неизвестный проект',
      agreeToTerms: data.agreeToTerms || false
    };
    
    // Добавляем произвольную тему, если выбрано "Другое"
    if (topic === FORM_TOPICS.OTHER && data.customTopic) {
      result.customTopic = data.customTopic;
    }
    
    // Добавляем UTM-метки если они есть
    if (Object.keys(utm).length > 0) {
      result.utm = utm;
    }
    
    return result;
  }
  
  /**
   * Извлекает UTM-метки из URL
   */
  private extractUtmParams(): Record<string, string> {
    const utm: Record<string, string> = {};
    
    // Если нет window, возвращаем пустой объект
    if (typeof window === 'undefined') {
      return utm;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // Получаем все возможные UTM-метки
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    for (const param of utmParams) {
      const value = urlParams.get(param);
      if (value) {
        // Преобразуем utm_source в source и т.д.
        const key = param.replace('utm_', '');
        utm[key] = value;
      }
    }
    
    return utm;
  }
}

export default ProjectConsultationAdapter; 