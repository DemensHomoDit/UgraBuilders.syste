// Базовый интерфейс для запросов к Bitrix24
export interface Bitrix24Request {
  method: string;
  data: any;
}

// Базовый интерфейс для ответов от Bitrix24
export interface Bitrix24Response {
  result: any;
  time: {
    start: number;
    finish: number;
    duration: number;
    processing: number;
    date_start: string;
    date_finish: string;
  };
}

// Интерфейс для создания лида в Bitrix24
export interface Bitrix24LeadCreate extends Bitrix24Request {
  method: 'crm.lead.add';
  data: {
    fields: Bitrix24LeadFields;
    params?: {
      REGISTER_SONET_EVENT?: 'Y' | 'N';
    };
  };
}

// Поля лида в Bitrix24
export interface Bitrix24LeadFields {
  TITLE: string;
  NAME?: string;
  LAST_NAME?: string;
  COMMENTS?: string;
  STATUS_ID?: string;
  OPENED?: 'Y' | 'N';
  ASSIGNED_BY_ID?: string;
  SOURCE_ID?: string;
  UTM_SOURCE?: string;
  UTM_MEDIUM?: string;
  UTM_CAMPAIGN?: string;
  UTM_CONTENT?: string;
  UTM_TERM?: string;
  EMAIL?: Bitrix24FieldMultipleValue[];
  PHONE?: Bitrix24FieldMultipleValue[];
  WEB?: Bitrix24FieldMultipleValue[];
  IM?: Bitrix24FieldMultipleValue[];
  [key: string]: any;
}

// Интерфейс для множественных полей в Bitrix24 (телефоны, email и т.д.)
export interface Bitrix24FieldMultipleValue {
  VALUE: string;
  VALUE_TYPE: string;
}

// Конфигурация подключения к Bitrix24
export interface Bitrix24Config {
  webhookUrl: string;
  timeout?: number;
  retry?: {
    attempts: number;
    delay: number;
  };
}

// Маппинг типов форм в типы сущностей Bitrix24
export const FORM_TO_BITRIX24_ENTITY = {
  'contact': 'lead',
  'consultation': 'lead',
  'comment': null, // не отправляем комментарии в Bitrix24
  'callback': 'lead'
}; 