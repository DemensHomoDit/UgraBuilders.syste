import React, { useState, useEffect } from "react";
import { Project } from "@/services/project/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { db } from "@/integrations/db/client";
import formIntegrationService from "@/services/integration/formIntegrationService";
import { FORM_TOPICS } from "@/services/integration/types/formTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Локальные константы для тем проекта
const PROJECT_FORM_TOPICS = {
  WANT_PROJECT: 'Хочу этот проект',
  GET_CONSULTATION: 'Получить консультацию',
  BUILDING_TECHNOLOGY: 'О технологии строительства',
  GET_PRICE: 'Узнать стоимость',
  OTHER: 'Другое'
};

// Локальный массив для выпадающего списка в форме проекта
const PROJECT_FORM_TOPIC_OPTIONS = [
  { value: PROJECT_FORM_TOPICS.WANT_PROJECT, label: 'Хочу этот проект' },
  { value: PROJECT_FORM_TOPICS.GET_CONSULTATION, label: 'Получить консультацию' },
  { value: PROJECT_FORM_TOPICS.GET_PRICE, label: 'Узнать стоимость' },
  { value: PROJECT_FORM_TOPICS.BUILDING_TECHNOLOGY, label: 'О технологии строительства' },
  { value: PROJECT_FORM_TOPICS.OTHER, label: 'Другое' }
];

// Соответствие локальных тем проекта глобальным темам для сохранения совместимости
const mapProjectTopicToGlobalTopic = (projectTopic: string): string => {
  switch (projectTopic) {
    case PROJECT_FORM_TOPICS.WANT_PROJECT:
      return FORM_TOPICS.BUILD_HOME;
    case PROJECT_FORM_TOPICS.GET_CONSULTATION:
      return FORM_TOPICS.HELP_WITH_CHOICE;
    case PROJECT_FORM_TOPICS.BUILDING_TECHNOLOGY:
      return FORM_TOPICS.BUILDING_TECHNOLOGY;
    case PROJECT_FORM_TOPICS.GET_PRICE:
      return FORM_TOPICS.CUSTOM_PROJECT;
    case PROJECT_FORM_TOPICS.OTHER:
      return FORM_TOPICS.OTHER;
    default:
      return FORM_TOPICS.OTHER;
  }
};

interface ProjectContactFormProps {
  project: Project;
  initialTopic?: string;
}

const ProjectContactForm: React.FC<ProjectContactFormProps> = ({ project, initialTopic }) => {
  // Преобразуем initialTopic в локальный формат если он задан
  const getInitialLocalTopic = () => {
    if (!initialTopic) return PROJECT_FORM_TOPICS.WANT_PROJECT;
    
    switch (initialTopic) {
      case FORM_TOPICS.BUILD_HOME:
        return PROJECT_FORM_TOPICS.WANT_PROJECT;
      case FORM_TOPICS.HELP_WITH_CHOICE:
        return PROJECT_FORM_TOPICS.GET_CONSULTATION;
      case FORM_TOPICS.BUILDING_TECHNOLOGY:
        return PROJECT_FORM_TOPICS.BUILDING_TECHNOLOGY;
      case FORM_TOPICS.CUSTOM_PROJECT:
        return PROJECT_FORM_TOPICS.GET_PRICE;
      case FORM_TOPICS.OTHER:
        return PROJECT_FORM_TOPICS.OTHER;
      default:
        return PROJECT_FORM_TOPICS.WANT_PROJECT;
    }
  };

  // Состояния формы
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState(getInitialLocalTopic());
  const [customTopic, setCustomTopic] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Состояние для валидации формы
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Обновляем тему, если изменяется initialTopic
  useEffect(() => {
    if (initialTopic) {
      setTopic(getInitialLocalTopic());
    }
  }, [initialTopic]);

  // Функция валидации
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = "Укажите ваше имя";
    if (!phone.trim()) newErrors.phone = "Укажите номер телефона";
    else if (!/^(\+7|8)[- ]?\(?[0-9]{3}\)?[- ]?[0-9]{3}[- ]?[0-9]{2}[- ]?[0-9]{2}$/.test(phone)) {
      newErrors.phone = "Укажите корректный номер телефона";
    }
    
    if (!email.trim()) newErrors.email = "Укажите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Укажите корректный email";
    }
    
    if (topic === PROJECT_FORM_TOPICS.OTHER && !customTopic.trim()) {
      newErrors.customTopic = "Укажите тему обращения";
    }

    if (!agreeToTerms) newErrors.terms = "Необходимо согласиться с условиями";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация формы
    if (!validateForm()) {
      toast.error("Пожалуйста, заполните все обязательные поля корректно");
      return;
    }

    setIsSubmitting(true);

    try {
      // Преобразуем локальную тему в глобальную для совместимости с API
      const globalTopic = mapProjectTopicToGlobalTopic(topic);
      
      // Формируем текст заявки
      const orderText = `
Заявка на проект: ${project.title}
Тема обращения: ${topic}${topic === PROJECT_FORM_TOPICS.OTHER ? ` (${customTopic})` : ''}
Имя: ${name}
Телефон: ${phone}
Email: ${email}
${message ? `Сообщение: ${message}` : ''}
      `.trim();

      // Отправляем данные в базу данных
      const { error } = await db
        .from('project_orders')
        .insert({
          project_id: project.id,
          user_email: email,
          user_phone: phone,
          notes: orderText,
          status: 'new'
        });
        
      if (error) throw error;
      
      // Формируем данные для отправки в CRM и внутреннюю систему
      const formData = {
        name,
        phone,
        email,
        message,
        topic: globalTopic, // Используем глобальный формат темы для интеграции с CRM
        customTopic: topic === PROJECT_FORM_TOPICS.OTHER ? customTopic : undefined,
        projectId: project.id,
        projectTitle: project.title,
        agreeToTerms
      };
      
      // Отправляем данные через сервис интеграции
      const integrationResult = await formIntegrationService.processFormData('consultation', formData);
      
      // Проверяем результат интеграции (не блокируем в случае ошибки)
      if (!integrationResult.bitrix24.success && !integrationResult.internalSystem.success) {
        console.error("Failed to send data to integration systems:", integrationResult);
      }
      
      // Показываем сообщение об успехе
      toast.success("Ваша заявка успешно отправлена!", {
        description: "Наш менеджер свяжется с вами в ближайшее время"
      });
      
      // Сбрасываем форму
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setTopic(PROJECT_FORM_TOPICS.WANT_PROJECT);
      setCustomTopic("");
      setAgreeToTerms(false);
      setErrors({});
      
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error);
      toast.error("Произошла ошибка при отправке заявки", {
        description: "Пожалуйста, попробуйте позже или свяжитесь с нами по телефону"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Форматирование номера телефона по мере ввода
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Ограничиваем длину до 11 цифр
    if (value.length > 11) value = value.slice(0, 11);
    
    // Форматируем в виде +7 (XXX) XXX-XX-XX
    if (value.length > 0) {
      if (value[0] === '7') {
        value = `+7${value.substring(1)}`;
      } else if (value[0] === '8') {
        value = `+7${value.substring(1)}`;
      } else {
        value = `+7${value}`;
      }
    }
    
    // Добавляем скобки и дефисы
    if (value.length > 2) {
      value = `${value.slice(0, 2)} (${value.slice(2)}`;
    }
    if (value.length > 7) {
      value = `${value.slice(0, 7)}) ${value.slice(7)}`;
    }
    if (value.length > 12) {
      value = `${value.slice(0, 12)}-${value.slice(12)}`;
    }
    if (value.length > 15) {
      value = `${value.slice(0, 15)}-${value.slice(15)}`;
    }
    
    setPhone(value);
  };

  // Определяем заголовок в зависимости от выбранной темы
  const getFormTitle = () => {
    switch (topic) {
      case PROJECT_FORM_TOPICS.WANT_PROJECT:
        return "Хочу этот проект";
      case PROJECT_FORM_TOPICS.GET_CONSULTATION:
        return "Получить консультацию";
      case PROJECT_FORM_TOPICS.BUILDING_TECHNOLOGY:
        return "О технологии строительства";
      case PROJECT_FORM_TOPICS.GET_PRICE:
        return "Узнать стоимость";
      default:
        return "Оставить заявку";
    }
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader className="bg-primary text-white rounded-t-lg">
        <CardTitle className="text-xl">{getFormTitle()}</CardTitle>
        <CardDescription className="text-white/80">
          Оставьте заявку по проекту {project.title}, и мы свяжемся с вами в ближайшее время
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="flex items-center justify-between">
              <span>Тема обращения*</span>
              {errors.topic && <span className="text-destructive text-xs">{errors.topic}</span>}
            </Label>
            <Select
              value={topic}
              onValueChange={setTopic}
            >
              <SelectTrigger className={errors.topic ? "border-destructive" : ""}>
                <SelectValue placeholder="Выберите тему обращения" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_FORM_TOPIC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {topic === PROJECT_FORM_TOPICS.OTHER && (
            <div className="space-y-2">
              <Label htmlFor="customTopic" className="flex items-center justify-between">
                <span>Укажите свою тему*</span>
                {errors.customTopic && <span className="text-destructive text-xs">{errors.customTopic}</span>}
              </Label>
              <Input
                id="customTopic"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Введите тему обращения"
                className={errors.customTopic ? "border-destructive" : ""}
                required={topic === PROJECT_FORM_TOPICS.OTHER}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center justify-between">
              <span>Ваше имя*</span>
              {errors.name && <span className="text-destructive text-xs">{errors.name}</span>}
            </Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Введите ваше имя"
              className={errors.name ? "border-destructive" : ""}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center justify-between">
              <span>Телефон*</span>
              {errors.phone && <span className="text-destructive text-xs">{errors.phone}</span>}
            </Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={handlePhoneChange} 
              placeholder="+7 (___) ___-__-__"
              className={errors.phone ? "border-destructive" : ""}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center justify-between">
              <span>Email*</span>
              {errors.email && <span className="text-destructive text-xs">{errors.email}</span>}
            </Label>
            <Input 
              id="email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@domain.com"
              className={errors.email ? "border-destructive" : ""}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Ваши вопросы или комментарии по проекту"
              rows={3}
            />
          </div>
          
          <div className="flex items-start space-x-2 relative">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              className={errors.terms ? "border-destructive" : ""}
            />
            <div>
              <Label 
                htmlFor="terms" 
                className={`text-sm ${errors.terms ? "text-destructive" : "text-muted-foreground"}`}
              >
                Я согласен с политикой обработки персональных данных
              </Label>
              {errors.terms && <p className="text-destructive text-xs mt-1">{errors.terms}</p>}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Отправить заявку
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectContactForm;
