// Базовый интерфейс для данных формы
export interface FormData {
  id?: string;
  timestamp: number;
  source: string; // URL или идентификатор источника
  formType: 'contact' | 'consultation' | 'comment' | 'callback';
  topic: string; // Тема обращения
  customTopic?: string; // Тема, введенная вручную, если выбрано "Другое"
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

// Константы для тем обращения
export const FORM_TOPICS = {
  BUILD_HOME: 'Хочу построить дом',
  HELP_WITH_CHOICE: 'Помогите с выбором',
  BUILDING_TECHNOLOGY: 'О технологии строительства',
  CUSTOM_PROJECT: 'Заказать индивидуальный проект',
  OTHER: 'Другое'
};

// Массив для выпадающего списка
export const FORM_TOPIC_OPTIONS = [
  { value: FORM_TOPICS.BUILD_HOME, label: 'Хочу построить дом' },
  { value: FORM_TOPICS.HELP_WITH_CHOICE, label: 'Помогите с выбором' },
  { value: FORM_TOPICS.BUILDING_TECHNOLOGY, label: 'О технологии строительства' },
  { value: FORM_TOPICS.CUSTOM_PROJECT, label: 'Заказать индивидуальный проект' },
  { value: FORM_TOPICS.OTHER, label: 'Другое' }
];

// Данные формы контактов
export interface ContactFormData extends FormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// Данные формы консультации по проекту
export interface ProjectConsultationData extends FormData {
  name: string;
  email: string;
  phone: string;
  message?: string;
  projectId: string;
  projectTitle: string;
  agreeToTerms: boolean;
}

// Данные формы комментариев
export interface CommentFormData extends FormData {
  name: string;
  email?: string;
  comment: string;
  blogPostId?: string;
  blogPostTitle?: string;
  parentCommentId?: string;
} 