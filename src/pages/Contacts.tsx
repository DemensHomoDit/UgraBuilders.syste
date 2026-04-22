import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import formIntegrationService from "@/services/integration/formIntegrationService";
import { FORM_TOPICS, FORM_TOPIC_OPTIONS } from "@/services/integration/types/formTypes";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, ArrowUpRight } from "lucide-react";

const Contacts = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState(FORM_TOPICS.BUILD_HOME);
  const [customTopic, setCustomTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await formIntegrationService.processFormData('contact', { name, email, phone, message, topic, customTopic: topic === FORM_TOPICS.OTHER ? customTopic : undefined });
      if (result.bitrix24.success || result.internalSystem.success) {
        toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
        setName(''); setEmail(''); setPhone(''); setMessage(''); setTopic(FORM_TOPICS.BUILD_HOME); setCustomTopic('');
      } else {
        toast.error("Не удалось отправить сообщение. Попробуйте позже или позвоните нам.");
      }
    } catch {
      toast.error("Произошла ошибка. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <section className="pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-14">
            <p className="label-tag mb-5">Контакты</p>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-2xl leading-[1.08]">
              Свяжитесь с нами
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Левая колонка */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <p className="text-lg text-gray-500 leading-relaxed mb-10">
                Свяжитесь с нами любым удобным способом. Мы всегда рады помочь
                с выбором проекта, ответить на вопросы и предоставить необходимую информацию.
              </p>

              <div className="space-y-5 mb-12">
                <a href="tel:+78003331111"
                  className="group flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-primary/5 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Телефон</div>
                    <div className="font-semibold text-gray-900">8 800 333-11-11</div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary ml-auto transition-colors" />
                </a>

                <a href="mailto:info@ugrabuilders.ru"
                  className="group flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-primary/5 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Email</div>
                    <div className="font-semibold text-gray-900">info@ugrabuilders.ru</div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary ml-auto transition-colors" />
                </a>
              </div>
            </motion.div>

            {/* Форма */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="bg-gray-50/80 rounded-3xl p-8 md:p-10 border border-gray-100/80">
                <h2 className="text-2xl font-bold text-gray-900 mb-7 tracking-tight">Отправить сообщение</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="topic" className="text-sm font-medium text-gray-700 mb-2 block">Тема обращения</Label>
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger className="rounded-xl border-gray-200 bg-white h-11">
                        <SelectValue placeholder="Выберите тему" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {FORM_TOPIC_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {topic === FORM_TOPICS.OTHER && (
                    <div>
                      <Label htmlFor="customTopic" className="text-sm font-medium text-gray-700 mb-2 block">Укажите тему</Label>
                      <Input id="customTopic" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} required className="rounded-xl border-gray-200 h-11" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">Имя</Label>
                      <Input id="name" placeholder="Ваше имя" required value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-gray-200 h-11" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">Телефон</Label>
                      <Input id="phone" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border-gray-200 h-11" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border-gray-200 h-11" />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">Сообщение</Label>
                    <Textarea id="message" placeholder="Расскажите о вашем проекте..." rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-xl border-gray-200 resize-none" />
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Contacts;
