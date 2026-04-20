import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import formIntegrationService from "@/services/integration/formIntegrationService";
import { FORM_TOPICS, FORM_TOPIC_OPTIONS } from "@/services/integration/types/formTypes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Contacts = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState(FORM_TOPICS.BUILD_HOME);
  const [customTopic, setCustomTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функция для обработки отправки формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Собираем данные формы
      const formData = {
        name,
        email,
        phone,
        message,
        topic,
        customTopic: topic === FORM_TOPICS.OTHER ? customTopic : undefined
      };
      
      // Отправляем данные через сервис интеграции
      const result = await formIntegrationService.processFormData('contact', formData);
      
      if (result.bitrix24.success || result.internalSystem.success) {
        toast.success("Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.");
        
        // Очищаем форму
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setTopic(FORM_TOPICS.BUILD_HOME);
        setCustomTopic('');
      } else {
        // Если обе системы вернули ошибку
        console.error("Integration failed:", result);
        toast.error("Не удалось отправить сообщение. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Контакты</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <p className="text-base md:text-lg text-muted-foreground mb-6">
                Свяжитесь с нами любым удобным способом. Мы всегда рады помочь
                вам с выбором проекта, ответить на все вопросы и предоставить
                необходимую информацию.
              </p>
              
              <div className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold text-primary">Телефон</h3>
                  <a href="tel:+78003331111" className="text-primary hover:text-primary/80 transition-colors block">
                    8 800 333-11-11
                  </a>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-primary">Email</h3>
                  <a href="mailto:info@ugrabuilders.ru" className="text-primary hover:text-primary/80 transition-colors block">
                    info@ugrabuilders.ru
                  </a>
                </div>
                
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-primary mb-4">Отправить сообщение</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Тема обращения
                  </Label>
                  <Select
                    value={topic}
                    onValueChange={setTopic}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тему" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORM_TOPIC_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {topic === FORM_TOPICS.OTHER && (
                  <div>
                    <Label htmlFor="customTopic" className="block text-sm font-medium text-gray-700 mb-1">
                      Укажите свою тему
                    </Label>
                    <Input
                      id="customTopic"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Введите тему обращения"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ваше имя
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Введите ваше имя" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </Label>
                  <Input 
                    id="phone" 
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Сообщение
                  </Label>
                  <Textarea 
                    id="message" 
                    placeholder="Ваше сообщение..." 
                    rows={4} 
                    required 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Отправить'}
                </Button>
              </form>
            </div>
          </div>
          
        </motion.div>
      </div>
      <Footer />
    </main>
  );
};

export default Contacts;
