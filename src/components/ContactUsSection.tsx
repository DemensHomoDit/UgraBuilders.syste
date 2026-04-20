import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import formIntegrationService from "@/services/integration/formIntegrationService";
import { FORM_TOPICS, FORM_TOPIC_OPTIONS } from "@/services/integration/types/formTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ContactUsSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState(FORM_TOPICS.BUILD_HOME);
  const [customTopic, setCustomTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await formIntegrationService.processFormData("contact", {
        name,
        email,
        phone,
        message,
        topic,
        customTopic: topic === FORM_TOPICS.OTHER ? customTopic : undefined,
      });

      if (result.bitrix24.success || result.internalSystem.success) {
        toast.success("Ваше сообщение успешно отправлено!");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setTopic(FORM_TOPICS.BUILD_HOME);
        setCustomTopic("");
      } else {
        toast.error("Не удалось отправить сообщение. Попробуйте позже.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при отправке формы.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-24 bg-accent/10 p-6 md:p-8 rounded-xl" id="feedback-form">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 text-center">Остались вопросы?</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Оставьте заявку – мы свяжемся с вами в ближайшее время и подробно проконсультируем.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="md:col-span-2">
          <Label htmlFor="topic" className="mb-1 block">Тема обращения</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тему" />
            </SelectTrigger>
            <SelectContent>
              {FORM_TOPIC_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {topic === FORM_TOPICS.OTHER && (
          <div className="md:col-span-2">
            <Label htmlFor="customTopic" className="mb-1 block">Укажите тему</Label>
            <Input id="customTopic" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} required />
          </div>
        )}

        <div>
          <Label htmlFor="name" className="mb-1 block">Имя</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1 block">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="phone" className="mb-1 block">Телефон</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="message" className="mb-1 block">Сообщение</Label>
          <Textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div className="md:col-span-2 flex justify-center">
          <Button type="submit" className="px-10" disabled={isSubmitting}>Отправить</Button>
        </div>
      </form>
    </section>
  );
};

export default ContactUsSection; 