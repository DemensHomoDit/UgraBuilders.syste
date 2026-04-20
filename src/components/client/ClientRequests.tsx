import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  ClipboardList,
  Plus,
} from "lucide-react";
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

interface ClientRequestsProps {
  user: any;
}

interface RequestItem {
  id: string;
  form_type?: string;
  topic?: string;
  custom_topic?: string;
  status: "new" | "processing" | "completed" | "rejected";
  created_at: string;
  source: "form" | "order";
}

const getFormTypeLabel = (type?: string): string => {
  switch (type) {
    case "contact":
      return "Обратная связь";
    case "consultation":
      return "Консультация";
    case "callback":
      return "Обратный звонок";
    case "comment":
      return "Комментарий";
    case "project_order":
      return "Заявка на проект";
    default:
      return type || "Заявка";
  }
};

const getStatusConfig = (
  status: string,
): { label: string; className: string } => {
  switch (status) {
    case "new":
      return {
        label: "Новая",
        className:
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
      };
    case "processing":
      return {
        label: "В обработке",
        className:
          "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
      };
    case "completed":
      return {
        label: "Выполнена",
        className:
          "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
      };
    case "rejected":
      return {
        label: "Отклонена",
        className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
      };
    default:
      return {
        label: "Неизвестно",
        className:
          "bg-muted text-muted-foreground border-border hover:bg-muted",
      };
  }
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Н/Д";
  try {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: ru });
  } catch {
    return "Некорректная дата";
  }
};

const RequestCard: React.FC<{ item: RequestItem }> = ({ item }) => {
  const title =
    item.topic ||
    (item.form_type ? getFormTypeLabel(item.form_type) : "Заявка");
  const fullTitle = item.custom_topic
    ? `${title} (${item.custom_topic})`
    : title;
  const typeLabel = getFormTypeLabel(item.form_type);
  const status = getStatusConfig(item.status);

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-accent/40 transition-colors">
      <div className="mt-0.5 flex-shrink-0 rounded-lg bg-primary/8 p-2">
        {item.source === "order" ? (
          <ClipboardList className="h-4 w-4 text-primary" />
        ) : (
          <FileText className="h-4 w-4 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-snug truncate">{fullTitle}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {typeLabel}&nbsp;·&nbsp;{formatDate(item.created_at)}
        </p>
      </div>

      <Badge
        variant="outline"
        className={`flex-shrink-0 text-xs font-medium ${status.className}`}
      >
        {status.label}
      </Badge>
    </div>
  );
};

const TOPIC_OPTIONS = [
  { value: "problem", label: "Проблема" },
  { value: "help", label: "Нужна помощь" },
  { value: "question", label: "Есть вопрос" },
  { value: "consultation", label: "Консультация" },
  { value: "callback", label: "Обратный звонок" },
  { value: "other", label: "Другое" },
] as const;

const ClientRequests: React.FC<ClientRequestsProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTopic, setFormTopic] = useState<string>("");
  const [formMessage, setFormMessage] = useState<string>("");
  const [formName, setFormName] = useState<string>(user.username || "");
  const [formPhone, setFormPhone] = useState<string>((user as any).phone || "");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [formsResult, ordersResult] = await Promise.all([
        db
          .from("form_submissions")
          .select("id, form_type, topic, custom_topic, status, created_at, data")
          .order("created_at", { ascending: false })
          .limit(50),

        db
          .from("project_orders")
          .select("id, form_type, topic, status, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      const formData = formsResult.data ?? [];
      const orderData = ordersResult.data ?? [];

      const userEmail = (user as any).email?.toLowerCase() || "";
      const userPhone = (user as any).phone || "";

      const filteredForms = formData.filter((r: any) => {
        const d = r.data || {};
        const email = (d.email || "").toLowerCase();
        const phone = d.phone || "";
        return email === userEmail || phone === userPhone;
      });

      const filteredOrders = (orderData || []).filter((r: any) => {
        const email = (r.user_email || "").toLowerCase();
        const phone = r.user_phone || "";
        return email === userEmail || phone === userPhone;
      });

      if (formsResult.error && formData.length === 0) throw formsResult.error;

      const formItems: RequestItem[] = filteredForms.map((r: any) => ({
        id: r.id,
        form_type: r.form_type,
        topic: r.topic,
        custom_topic: r.custom_topic,
        status: r.status || "new",
        created_at: r.created_at,
        source: "form" as const,
      }));

      const orderItems: RequestItem[] = filteredOrders.map((r: any) => ({
        id: r.id,
        form_type: r.form_type,
        topic: r.topic,
        status: r.status || "new",
        created_at: r.created_at,
        source: "order" as const,
      }));

      const merged = [...formItems, ...orderItems].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setRequests(merged);
    } catch (error) {
      toast.error("Ошибка загрузки", {
        description: "Не удалось загрузить ваши заявки",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!formTopic) {
      toast.error("Выберите тему обращения");
      return;
    }
    if (!formMessage.trim()) {
      toast.error("Опишите ваш вопрос");
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await db.from("form_submissions").insert({
        form_type: formTopic === "callback" ? "callback" : "contact",
        topic: TOPIC_OPTIONS.find((o) => o.value === formTopic)?.label || formTopic,
        source: "client_dashboard",
        status: "new",
        data: {
          name: formName,
          phone: formPhone,
          email: user.email,
          message: formMessage.trim(),
          user_id: user.id,
        },
      });
      if (error) throw error;
      toast.success("Заявка отправлена");
      setDialogOpen(false);
      setFormTopic("");
      setFormMessage("");
      loadData();
    } catch (err) {
      toast.error("Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full py-6 text-base gap-2">
            <Plus className="h-5 w-5" />
            Создать заявку
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новая заявка</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Тема обращения</label>
              <Select value={formTopic} onValueChange={setFormTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тему" />
                </SelectTrigger>
                <SelectContent>
                  {TOPIC_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ваше имя</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Имя" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Телефон</label>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Опишите вашу проблему или вопрос…"
                rows={4}
              />
            </div>
            <Button className="w-full" onClick={handleSubmitRequest} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Отправить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка заявок…</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-14 w-14 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-foreground mb-1">У вас пока нет заявок</p>
            <p className="text-sm">Нажмите кнопку «Создать заявку» выше, чтобы отправить обращение</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Ваши заявки
              </CardTitle>
              <CardDescription className="mt-0.5">
                История ваших обращений
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={loadData}
              disabled={loading}
              title="Обновить"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requests.map((item) => (
                <RequestCard key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientRequests;