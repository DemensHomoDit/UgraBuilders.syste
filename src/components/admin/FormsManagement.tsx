import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RefreshCw,
  Search,
  Clock,
  FileText,
  AlertTriangle,
  Pin,
  PinOff,
  Link,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import syncService from "@/services/integration/syncService";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useDebounce } from "@/hooks/useDebounce";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import AdminSectionHeader from "@/components/admin/shared/AdminSectionHeader";
import AdminPagination from "@/components/admin/shared/AdminPagination";
import { notifySuccess, notifyError } from "@/utils/notify";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Компонент для управления формами и синхронизацией с Bitrix24
 */
export default function FormsManagement() {
  // Состояния для списка форм
  const [formSubmissions, setFormSubmissions] = useState<any[]>([]);
  const [bitrixLeads, setBitrixLeads] = useState<any[]>([]);
  const [pinnedForms, setPinnedForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("forms");
  const [formTypeFilter, setFormTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [formsSummary, setFormsSummary] = useState({
    total: 0,
    new_count: 0,
    in_progress_count: 0,
    pinned_count: 0,
    today_count: 0,
  });

  // Дебаунс поисковой строки
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Первоначальная загрузка данных
  useEffect(() => {
    loadData();
  }, [
    activeTab,
    formTypeFilter,
    statusFilter,
    currentPage,
    debouncedSearchQuery,
  ]);

  // Функция загрузки данных
  const loadData = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (activeTab === "forms") {
        await Promise.all([loadFormSubmissions(), loadFormsSummary()]);
      } else {
        await loadBitrixLeads();
      }
    } catch (error) {
      notifyError("Не удалось загрузить данные", "forms-load");
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка заявок из форм
  const loadFormSubmissions = async () => {
    try {
      const { data: sessionData } = await db.auth.getSession();
      const token = sessionData?.session?.access_token;
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
        status: statusFilter || "all",
        formType: formTypeFilter || "all",
        search: debouncedSearchQuery || "",
        pinnedOnly: String(showPinnedOnly),
      });

      const response = await fetch(`${API_BASE}/api/admin/forms/list?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const body = await response.json();

      if (!response.ok || !body?.success) {
        throw new Error(body?.error || "Не удалось загрузить заявки");
      }

      setFormSubmissions(body.data || []);
      setPinnedForms(body.pinned || []);
      setTotalItems(body.pagination?.total || 0);
      setTotalPages(body.pagination?.totalPages || 1);
    } catch (error) {
      throw error;
    }
  };

  const loadFormsSummary = async () => {
    try {
      const { data: sessionData } = await db.auth.getSession();
      const token = sessionData?.session?.access_token;
      const response = await fetch(`${API_BASE}/api/admin/forms/summary`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const body = await response.json();
      if (!response.ok || !body?.success) {
        return;
      }
      setFormsSummary(body.data || formsSummary);
    } catch (_) {
      // ignore summary errors
    }
  };

  // Загрузка лидов из Bitrix24
  const loadBitrixLeads = async () => {
    try {
      const query = db.from("bitrix_leads").select("*");

      // Пагинация
      const limit = 10;
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      let filtered = data || [];
      if (debouncedSearchQuery) {
        const q = debouncedSearchQuery.toLowerCase();
        filtered = filtered.filter((item: any) => {
          const title = String(item.title || "").toLowerCase();
          const name = String(item.name || "").toLowerCase();
          const email = String(item.email || "").toLowerCase();
          const phone = String(item.phone || "").toLowerCase();
          return (
            title.includes(q) ||
            name.includes(q) ||
            email.includes(q) ||
            phone.includes(q)
          );
        });
      }

      const paginated = filtered.slice(from, to + 1);

      setBitrixLeads(paginated);
      setTotalItems(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / limit)));
    } catch (error) {
      throw error;
    }
  };

  // Синхронизация с Bitrix24
  const syncWithBitrix24 = async () => {
    if (isSyncing) return; // Предотвращаем повторный запуск

    try {
      setIsSyncing(true);
      const result = await syncService.syncLeadsFromBitrix24(50); // Синхронизируем последние 50 лидов

      if (result.success) {
        toast.success(result.message);

        // После успешной синхронизации запускаем связывание
        await linkFormsToBitrix();

        // Обновляем данные после синхронизации
        if (activeTab === "bitrix") {
          await loadBitrixLeads();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Не удалось выполнить синхронизацию");
    } finally {
      setIsSyncing(false);
    }
  };

  // Функция для синхронизации заявок с лидами Bitrix24
  const linkFormsToBitrix = async () => {
    if (isLinking) return; // Предотвращаем повторный запуск

    try {
      setIsLinking(true);

      // Вызываем API для связывания заявок
      const response = await fetch("/api/admin/link-forms-to-bitrix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `${result.message}. Связано: ${result.linked}, ошибок: ${result.errors}`,
        );
        // Обновляем данные после синхронизации
        await loadData();
      } else {
        toast.error(`Ошибка связывания: ${result.error || result.message}`);
      }
    } catch (error) {
      toast.error("Не удалось выполнить связывание");
    } finally {
      setIsLinking(false);
    }
  };

  // Обработка выбора элемента для просмотра деталей
  const handleViewDetails = (item: any) => {
    // Проверяем, что компонент не находится в процессе обновления
    if (isLoading || isSyncing) return;

    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const normalizeStatus = (status?: string) => {
    if (status === "processing") return "in_progress";
    return status || "new";
  };

  // Изменение статуса заявки
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const normalizedStatus = normalizeStatus(status);
      const result = await syncService.updateFormSubmissionStatus(
        id,
        normalizedStatus,
      );

      if (result.success) {
        notifySuccess(result.message, `forms-status-${id}`);
        await loadFormSubmissions();

        if (selectedItem && selectedItem.id === id) {
          setSelectedItem({ ...selectedItem, status: normalizedStatus });
        }
      } else {
        notifyError(result.message, `forms-status-${id}`);
      }
    } catch (error) {
      notifyError("Не удалось обновить статус заявки", `forms-status-${id}`);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: ru });
    } catch (e) {
      return "Некорректная дата";
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (normalizeStatus(status)) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Отображение типа формы
  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case "contact":
        return "Контактная форма";
      case "consultation":
        return "Консультация по проекту";
      case "comment":
        return "Комментарий";
      case "callback":
        return "Обратный звонок";
      default:
        return type;
    }
  };

  // Функция для закрепления/открепления формы
  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const result = await syncService.toggleFormPin(id, !isPinned);

      if (result.success) {
        notifySuccess(result.message, `forms-pin-${id}`);
        loadFormSubmissions();

        if (selectedItem && selectedItem.id === id) {
          setSelectedItem({ ...selectedItem, is_pinned: !isPinned });
        }
      } else {
        notifyError(result.message, `forms-pin-${id}`);
      }
    } catch (error) {
      notifyError("Не удалось изменить статус закрепления", `forms-pin-${id}`);
    }
  };

  // Функция для просмотра всех заявок в таблице (без фильтров)
  const showAllSubmissions = async () => {
    try {
      setIsLoading(true);

      setFormTypeFilter(null);
      setStatusFilter(null);
      setShowPinnedOnly(false);
      setSearchQuery("");
      setCurrentPage(1);
      await loadData();
      notifySuccess("Фильтры сброшены, показаны все заявки", "forms-reset");
    } catch (error) {
      notifyError("Не удалось загрузить заявки", "forms-reset");
    } finally {
      setIsLoading(false);
    }
  };

  // Безопасное получение значения из данных формы
  const safeGetFormData = (
    submission: any,
    path: string,
    defaultValue: string = "Н/Д",
  ) => {
    try {
      // Разбиваем путь на части (например, data.name)
      const parts = path.split(".");
      let value = submission;

      // Проходим по частям пути
      for (const part of parts) {
        if (value === null || value === undefined) return defaultValue;
        value = value[part];
      }

      // Если значение null, undefined или пустая строка - возвращаем defaultValue
      if (value === null || value === undefined || value === "")
        return defaultValue;

      return String(value);
    } catch (e) {
      return defaultValue;
    }
  };

  // Функция для исправления структуры данных заявки
  const fixSubmissionData = async (submission: any) => {
    try {
      // Создаем корректную структуру данных
      const fixedData = {
        ...submission,
        form_type: submission.form_type || "contact",
        topic: submission.topic || "Общий вопрос",
        status: submission.status || "new",
        data: submission.data || {
          name: submission.name || "Неизвестно",
          email: submission.email || "",
          phone: submission.phone || "",
          message: submission.message || "",
        },
      };

      // Обновляем запись в базе данных
      const { error } = await db
        .from("form_submissions")
        .update(fixedData)
        .eq("id", submission.id);

      if (error) throw error;

      toast.success("Структура данных успешно исправлена");

      // Обновляем данные на странице
      loadData();

      // Если открыт диалог деталей, обновляем выбранный элемент
      if (selectedItem && selectedItem.id === submission.id) {
        setSelectedItem(fixedData);
      }
    } catch (error) {
      toast.error("Не удалось исправить структуру данных");
    }
  };

  // Функция для обработки диалога деталей
  const renderDetailDialog = () => {
    if (!selectedItem) return null;

    return (
      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          // Не закрываем диалог, если идет загрузка
          if (!open && (isLoading || isSyncing)) return;
          setIsDetailsOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "forms"
                ? `Детали заявки: ${selectedItem?.topic || "Без темы"}`
                : `Детали лида: ${selectedItem?.title || "Без заголовка"}`}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "forms"
                ? `Заявка от ${formatDate(selectedItem?.created_at || "")}`
                : `Лид создан ${formatDate(selectedItem?.created_at || "")}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {activeTab === "forms" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Основная информация</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Тип формы:
                        </span>
                        <span>
                          {getFormTypeLabel(
                            selectedItem.form_type || "contact",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Тема:</span>
                        <span>{selectedItem.topic || "Без темы"}</span>
                      </div>
                      {selectedItem.custom_topic && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Своя тема:
                          </span>
                          <span>{selectedItem.custom_topic}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Статус:</span>
                        <Select
                          value={selectedItem.status || "new"}
                          onValueChange={(value) =>
                            handleStatusChange(selectedItem.id, value)
                          }
                        >
                          <SelectTrigger
                            className={`w-[150px] ${getStatusColor(selectedItem.status || "new")}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новая</SelectItem>
                            <SelectItem value="in_progress">
                              В обработке
                            </SelectItem>
                            <SelectItem value="completed">Завершена</SelectItem>
                            <SelectItem value="rejected">Отклонена</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Источник:</span>
                        <span>{selectedItem.source || "Не указан"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Закреплена:
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleTogglePin(
                              selectedItem.id,
                              !!selectedItem.is_pinned,
                            )
                          }
                        >
                          {selectedItem.is_pinned ? (
                            <>
                              <PinOff className="mr-2 h-4 w-4" /> Открепить
                            </>
                          ) : (
                            <>
                              <Pin className="mr-2 h-4 w-4" /> Закрепить
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Данные контакта</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Имя:</span>
                        <span>
                          {safeGetFormData(selectedItem, "data.name")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>
                          {safeGetFormData(selectedItem, "data.email")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Телефон:</span>
                        <span>
                          {safeGetFormData(selectedItem, "data.phone")}
                        </span>
                      </div>
                      {safeGetFormData(selectedItem, "data.projectTitle") !==
                        "Н/Д" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Проект:</span>
                          <span>
                            {safeGetFormData(selectedItem, "data.projectTitle")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {safeGetFormData(selectedItem, "data.message") !== "Н/Д" && (
                  <div>
                    <h3 className="font-semibold mb-2">Сообщение</h3>
                    <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                      {safeGetFormData(selectedItem, "data.message")}
                    </div>
                  </div>
                )}

                {/* Проверка структуры данных */}
                {(!selectedItem.data ||
                  typeof selectedItem.data !== "object") && (
                  <div className="mt-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <AlertTitle>Некорректная структура данных</AlertTitle>
                      <AlertDescription>
                        Заявка имеет некорректную структуру данных. Нажмите
                        кнопку ниже, чтобы исправить.
                      </AlertDescription>
                    </Alert>
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => fixSubmissionData(selectedItem)}
                    >
                      Исправить структуру данных
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Основная информация</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ID в Bitrix24:
                        </span>
                        <span>{selectedItem.lead_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Заголовок:
                        </span>
                        <span>{selectedItem.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Статус:</span>
                        <Badge variant="outline">
                          {selectedItem.status_id || "Не указан"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Источник:</span>
                        <span>{selectedItem.source_id || "Не указан"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Последняя синхронизация:
                        </span>
                        <span>{formatDate(selectedItem.last_sync)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Данные контакта</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Имя:</span>
                        <span>
                          {`${selectedItem.name || ""} ${selectedItem.last_name || ""}`.trim() ||
                            "Не указано"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedItem.email || "Не указан"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Телефон:</span>
                        <span>{selectedItem.phone || "Не указан"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Полные данные лида */}
                <div>
                  <h3 className="font-semibold mb-2">Все данные лида (JSON)</h3>
                  <div className="bg-muted p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">
                      {JSON.stringify(
                        selectedItem.raw_data || selectedItem,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <AdminSectionHeader
          title="Формы и CRM"
          description="Обработка заявок, синхронизация и контроль статусов"
        />
        <div className="flex gap-2">
          <Button onClick={syncWithBitrix24} disabled={isSyncing || isLoading}>
            {isSyncing ? (
              <>⌛ Синхронизация...</>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Синхронизировать с
                Bitrix24
              </>
            )}
          </Button>

          {/* Новая кнопка для связывания заявок */}
          <Button
            onClick={linkFormsToBitrix}
            disabled={isLinking || isLoading}
            variant="outline"
          >
            {isLinking ? (
              <>⌛ Связывание...</>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" /> Связать заявки с лидами
              </>
            )}
          </Button>

          {/* Кнопка для просмотра всех заявок */}
          <Button
            variant="outline"
            onClick={showAllSubmissions}
            disabled={isLoading}
          >
            Показать все заявки
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="forms" className="flex-1">
            Заявки с форм
          </TabsTrigger>
          <TabsTrigger value="bitrix" className="flex-1">
            Данные из Bitrix24
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap gap-4 my-4 items-end">
          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {activeTab === "forms" && (
            <>
              <div className="w-full md:w-auto">
                <Label htmlFor="formTypeFilter">Тип формы</Label>
                <Select
                  value={formTypeFilter || "all"}
                  onValueChange={(value) =>
                    setFormTypeFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger id="formTypeFilter" className="w-[180px]">
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="contact">Контактная форма</SelectItem>
                    <SelectItem value="consultation">Консультация</SelectItem>
                    <SelectItem value="comment">Комментарий</SelectItem>
                    <SelectItem value="callback">Обратный звонок</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <Label htmlFor="statusFilter">Статус</Label>
                <Select
                  value={statusFilter || "all"}
                  onValueChange={(value) =>
                    setStatusFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger id="statusFilter" className="w-[180px]">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="new">Новые</SelectItem>
                    <SelectItem value="in_progress">В обработке</SelectItem>
                    <SelectItem value="completed">Завершенные</SelectItem>
                    <SelectItem value="rejected">Отклоненные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading || isSyncing}
          >
            {isLoading ? (
              <>⌛ Обновление...</>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Обновить
              </>
            )}
          </Button>

          {/* Кнопка сброса фильтров */}
          {(formTypeFilter ||
            statusFilter ||
            showPinnedOnly ||
            searchQuery) && (
            <Button
              variant="ghost"
              onClick={() => {
                setFormTypeFilter(null);
                setStatusFilter(null);
                setShowPinnedOnly(false);
                setSearchQuery("");
                setCurrentPage(1);
                setTimeout(loadData, 100);
              }}
              disabled={isLoading || isSyncing}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>

        <TabsContent value="forms" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold">{formsSummary.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Новые</p>
                <p className="text-2xl font-bold text-orange-600">{formsSummary.new_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">В работе</p>
                <p className="text-2xl font-bold text-blue-600">{formsSummary.in_progress_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Закреплено</p>
                <p className="text-2xl font-bold text-violet-600">{formsSummary.pinned_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Сегодня</p>
                <p className="text-2xl font-bold text-green-600">{formsSummary.today_count}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Заявки с форм обратной связи</CardTitle>
                  <CardDescription>
                    Управление заявками, полученными через формы обратной связи
                    на сайте
                  </CardDescription>
                </div>
                <div>
                  <Button
                    variant={showPinnedOnly ? "default" : "outline"}
                    onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                    className="ml-2"
                  >
                    {showPinnedOnly ? (
                      <>
                        <PinOff className="mr-2 h-4 w-4" /> Все заявки
                      </>
                    ) : (
                      <>
                        <Pin className="mr-2 h-4 w-4" /> Только закрепленные
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <span className="h-8 w-8 animate-spin text-muted-foreground">
                    ⌛
                  </span>
                </div>
              ) : (
                <>
                  {/* Секция закрепленных форм, если не в режиме "только закрепленные" */}
                  {!showPinnedOnly && pinnedForms.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Pin className="mr-2 h-4 w-4" /> Закрепленные заявки
                      </h3>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Дата</TableHead>
                              <TableHead>Тип</TableHead>
                              <TableHead>Тема</TableHead>
                              <TableHead>Имя</TableHead>
                              <TableHead>Контакт</TableHead>
                              <TableHead>Статус</TableHead>
                              <TableHead className="text-right">
                                Действия
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pinnedForms.map((submission) => (
                              <TableRow key={submission.id}>
                                <TableCell>
                                  <div className="flex items-center text-sm">
                                    <Clock className="mr-2 h-4 w-4" />
                                    {formatDate(submission.created_at)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getFormTypeLabel(
                                      submission.form_type || "contact",
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {submission.topic || "Без темы"}
                                  {submission.custom_topic && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({submission.custom_topic})
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {safeGetFormData(submission, "data.name")}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    {safeGetFormData(
                                      submission,
                                      "data.email",
                                    ) !== "Н/Д" && (
                                      <div>
                                        {safeGetFormData(
                                          submission,
                                          "data.email",
                                        )}
                                      </div>
                                    )}
                                    {safeGetFormData(
                                      submission,
                                      "data.phone",
                                    ) !== "Н/Д" && (
                                      <div>
                                        {safeGetFormData(
                                          submission,
                                          "data.phone",
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={submission.status || "new"}
                                    onValueChange={(value) =>
                                      handleStatusChange(submission.id, value)
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-[130px] ${getStatusColor(submission.status || "new")}`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">Новая</SelectItem>
                                      <SelectItem value="in_progress">
                                        В обработке
                                      </SelectItem>
                                      <SelectItem value="completed">
                                        Завершена
                                      </SelectItem>
                                      <SelectItem value="rejected">
                                        Отклонена
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        handleTogglePin(
                                          submission.id,
                                          submission.is_pinned,
                                        )
                                      }
                                    >
                                      <PinOff className="h-4 w-4 text-red-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        handleViewDetails(submission)
                                      }
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Основная таблица заявок */}
                  <Table>
                    <TableCaption>Всего заявок: {totalItems}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Тема</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Контакт</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formSubmissions && formSubmissions.length > 0 ? (
                        formSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Clock className="mr-2 h-4 w-4" />
                                {formatDate(submission.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getFormTypeLabel(
                                  submission.form_type || "contact",
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {submission.topic || "Без темы"}
                              {submission.custom_topic && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({submission.custom_topic})
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {safeGetFormData(submission, "data.name")}
                            </TableCell>
                            <TableCell>
                              <div>
                                {safeGetFormData(submission, "data.email") !==
                                  "Н/Д" && (
                                  <div>
                                    {safeGetFormData(submission, "data.email")}
                                  </div>
                                )}
                                {safeGetFormData(submission, "data.phone") !==
                                  "Н/Д" && (
                                  <div>
                                    {safeGetFormData(submission, "data.phone")}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={submission.status || "new"}
                                onValueChange={(value) =>
                                  handleStatusChange(submission.id, value)
                                }
                              >
                                <SelectTrigger
                                  className={`w-[130px] ${getStatusColor(submission.status || "new")}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Новая</SelectItem>
                                  <SelectItem value="in_progress">
                                    В обработке
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Завершена
                                  </SelectItem>
                                  <SelectItem value="rejected">
                                    Отклонена
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    handleTogglePin(
                                      submission.id,
                                      !!submission.is_pinned,
                                    )
                                  }
                                >
                                  {submission.is_pinned ? (
                                    <PinOff className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <Pin className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleViewDetails(submission)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">
                                Нет данных для отображения (всего заявок:{" "}
                                {totalItems})
                              </p>
                              {totalItems > 0 && (
                                <Button
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => {
                                    // Сбрасываем все фильтры и перезагружаем данные
                                    setFormTypeFilter(null);
                                    setStatusFilter(null);
                                    setShowPinnedOnly(false);
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                    // Добавляем небольшую задержку перед загрузкой данных
                                    setTimeout(loadData, 100);
                                  }}
                                >
                                  Сбросить фильтры
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <AdminPagination
                      page={currentPage}
                      totalPages={totalPages}
                      total={totalItems}
                      isLoading={isLoading}
                      onPrev={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      onNext={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bitrix" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Данные из Bitrix24 CRM</CardTitle>
              <CardDescription>
                Синхронизированные лиды из Bitrix24 CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <span className="h-8 w-8 animate-spin text-muted-foreground">
                    ⌛
                  </span>
                </div>
              ) : (
                <>
                  <Table>
                    <TableCaption>Всего лидов: {totalItems}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Заголовок</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Создан</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bitrixLeads.length > 0 ? (
                        bitrixLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>{lead.lead_id}</TableCell>
                            <TableCell>{lead.title}</TableCell>
                            <TableCell>
                              {lead.name} {lead.last_name}
                            </TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.status_id}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(lead.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                onClick={() => handleViewDetails(lead)}
                              >
                                <FileText className="h-4 w-4" /> Детали
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">
                                Нет данных для отображения
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <AdminPagination
                      page={currentPage}
                      totalPages={totalPages}
                      total={totalItems}
                      isLoading={isLoading}
                      onPrev={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      onNext={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог для отображения деталей */}
      {renderDetailDialog()}
    </div>
  );
}
