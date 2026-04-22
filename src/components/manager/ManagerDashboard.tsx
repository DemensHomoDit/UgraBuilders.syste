import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/services/authService";
import authService from "@/services/authService";
import fileService, { ClientFile } from "@/services/fileService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  TrendingUp,
  CalendarDays,
  Images,
  Video,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  RefreshCw,
  ClipboardList,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  X,
  ExternalLink,
  File,
  Download,
  Eye,
  MapPin,
  Building2,
  HardHat,
  Camera,
  Box,
  FileImage,
  File as FileIcon,
  MoreVertical,
  Edit3,
  StickyNote,
  Bell,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import { db } from "@/integrations/db/client";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";

interface ManagerDashboardProps {
  user: User;
}

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  client_id?: string;
  created_at: string;
}

interface FormSubmission {
  id: string;
  form_type: string;
  data: any;
  status: "new" | "processed" | "closed";
  created_at: string;
  processed?: boolean;
}

interface ClientProject {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  areavalue?: number;
  pricevalue?: number;
  status?: string;
  progress?: number;
  address?: string;
}

interface ClientCamera {
  id: string;
  title: string;
  location?: string;
  embedUrl?: string;
  streamUrl?: string;
  isOnline: boolean;
}

interface ClientNote {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

// Status helpers
const PRIORITY_COLORS = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const STAGE_COLORS: Record<string, string> = {
  "Холодный звонок": "bg-slate-100 text-slate-700",
  "Первичный интерес": "bg-blue-100 text-blue-700",
  "Переговоры": "bg-amber-100 text-amber-700",
  "Расчет сметы": "bg-purple-100 text-purple-700",
  "Подписание договора": "bg-pink-100 text-pink-700",
  "Оплата аванса": "bg-indigo-100 text-indigo-700",
  "Начало строительства": "bg-cyan-100 text-cyan-700",
  "В процессе строительства": "bg-sky-100 text-sky-700",
  "Завершение работ": "bg-teal-100 text-teal-700",
  "Сдача объекта": "bg-green-100 text-green-700",
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user }) => {
  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requests, setRequests] = useState<FormSubmission[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([loadClients(), loadTasks(), loadRequests()]);
    setIsLoading(false);
  };

  const loadClients = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setClients(allUsers.filter((u) => u.role === "client"));
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await db
        .from("tasks")
        .select("*")
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (!error) setTasks(data || []);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await db
        .from("form_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error) setRequests(data || []);
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  };

  // Stats
  const stats = {
    totalClients: clients.length,
    newRequests: requests.filter((r) => r.status === "new" || !r.processed).length,
    pendingTasks: tasks.filter((t) => t.status === "pending").length,
    overdueTasks: tasks.filter(
      (t) =>
        t.status === "pending" &&
        t.due_date &&
        new Date(t.due_date) < new Date()
    ).length,
  };

  // Filter clients
  const filteredClients = clients.filter(
    (c) =>
      c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Client card component
  const ClientCard: React.FC<{ client: User }> = ({ client }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [clientProject, setClientProject] = useState<ClientProject | null>(null);
    const [clientFiles, setClientFiles] = useState<ClientFile[]>([]);
    const [clientCameras, setClientCameras] = useState<ClientCamera[]>([]);
    const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
    const [activeClientTab, setActiveClientTab] = useState("overview");
    const [isLoadingClient, setIsLoadingClient] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [newCamera, setNewCamera] = useState({
      title: "",
      location: "",
      embedUrl: "",
      streamUrl: "",
    });

    // Load client data when expanded
    useEffect(() => {
      if (isExpanded) {
        loadClientData();
      }
    }, [isExpanded]);

    const loadClientData = async () => {
      setIsLoadingClient(true);
      try {
        // Load project
        const { data: projectData } = await db
          .from("projects")
          .select("*")
          .eq("created_by", client.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (projectData) {
          setClientProject(projectData as ClientProject);
        }

        // Load files
        const files = await fileService.getClientFiles(client.id, "documents");
        const contracts = await fileService.getClientFiles(client.id, "contracts");
        setClientFiles([...files, ...contracts]);

        // Load cameras from profile
        const { data: profile } = await db
          .from("user_profiles")
          .select("cameras, notes")
          .eq("id", client.id)
          .single();
        if (profile?.cameras) {
          try {
            const parsed = typeof profile.cameras === 'string' ? JSON.parse(profile.cameras) : profile.cameras;
            setClientCameras(Array.isArray(parsed) ? parsed : []);
          } catch { setClientCameras([]); }
        }
        if (profile?.notes) {
          try {
            const parsed = typeof profile.notes === 'string' ? JSON.parse(profile.notes) : profile.notes;
            setClientNotes(Array.isArray(parsed) ? parsed : []);
          } catch { setClientNotes([]); }
        }
      } catch (err) {
        console.error("Error loading client data:", err);
      } finally {
        setIsLoadingClient(false);
      }
    };

    const handleAddNote = async () => {
      if (!noteText.trim()) return;
      const newNote: ClientNote = {
        id: Math.random().toString(36).substr(2, 9),
        content: noteText,
        created_at: new Date().toISOString(),
        created_by: user.id,
      };
      const updatedNotes = [...clientNotes, newNote];
      try {
        const { error } = await db
          .from("user_profiles")
          .update({ notes: JSON.stringify(updatedNotes) })
          .eq("id", client.id);
        if (error) throw error;
        setClientNotes(updatedNotes);
        setNoteText("");
        toast({ title: "Заметка добавлена" });
      } catch (err: any) {
        toast({ title: "Ошибка сохранения", description: err.message, variant: "destructive" });
      }
    };

    const handleAddCamera = async () => {
      if (!newCamera.title.trim()) return;
      const camera: ClientCamera = {
        id: Math.random().toString(36).substr(2, 9),
        ...newCamera,
        isOnline: true,
      };
      const updatedCameras = [...clientCameras, camera];
      try {
        const { error } = await db
          .from("user_profiles")
          .update({ cameras: JSON.stringify(updatedCameras) })
          .eq("id", client.id);
        if (error) throw error;
        setClientCameras(updatedCameras);
        setNewCamera({ title: "", location: "", embedUrl: "", streamUrl: "" });
        toast({ title: "Камера добавлена" });
      } catch (err: any) {
        toast({ title: "Ошибка сохранения", description: err.message, variant: "destructive" });
      }
    };

    const handleDeleteCamera = async (cameraId: string) => {
      const updated = clientCameras.filter((c) => c.id !== cameraId);
      try {
        const { error } = await db
          .from("user_profiles")
          .update({ cameras: JSON.stringify(updated) })
          .eq("id", client.id);
        if (error) throw error;
        setClientCameras(updated);
      } catch (err: any) {
        toast({ title: "Ошибка удаления", description: err.message, variant: "destructive" });
      }
    };

    const handleDeleteNote = async (noteId: string) => {
      const updated = clientNotes.filter((n) => n.id !== noteId);
      try {
        const { error } = await db
          .from("user_profiles")
          .update({ notes: JSON.stringify(updated) })
          .eq("id", client.id);
        if (error) throw error;
        setClientNotes(updated);
      } catch (err: any) {
        toast({ title: "Ошибка удаления", description: err.message, variant: "destructive" });
      }
    };

    const handleDeleteFile = async (fileId: string) => {
      try {
        const success = await fileService.deleteFile(fileId);
        if (success) {
          setClientFiles(clientFiles.filter((f) => f.id !== fileId));
          toast({ title: "Файл удалён" });
        }
      } catch (err: any) {
        toast({ title: "Ошибка удаления файла", description: err.message, variant: "destructive" });
      }
    };

    const handleStageChange = async (newStage: string) => {
      try {
        const result = await authService.updateClientSaleStage(client.id, newStage);
        if (!result) throw new Error("Не удалось обновить этап");
        toast({ title: "Этап обновлён" });
        loadClients();
      } catch (err: any) {
        toast({ title: "Ошибка обновления этапа", description: err.message, variant: "destructive" });
      }
    };

    const stages = authService.getClientStages();

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card overflow-hidden"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {client.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{client.username}</p>
            <p className="text-xs text-muted-foreground truncate">{client.email}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs flex-shrink-0",
              STAGE_COLORS[client.clientStage || "Холодный звонок"]
            )}
          >
            {client.clientStage || "Нет этапа"}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t"
            >
              {isLoadingClient ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Quick Actions Bar */}
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={client.clientStage || stages[0]}
                      onValueChange={handleStageChange}
                    >
                      <SelectTrigger className="h-8 text-xs w-48">
                        <SelectValue placeholder="Этап продаж" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage} className="text-xs">
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone || "Нет телефона"}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </Button>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeClientTab} onValueChange={setActiveClientTab}>
                    <TabsList className="grid grid-cols-5 h-8">
                      <TabsTrigger value="overview" className="text-xs">
                        Обзор
                      </TabsTrigger>
                      <TabsTrigger value="project" className="text-xs">
                        Проект
                      </TabsTrigger>
                      <TabsTrigger value="files" className="text-xs">
                        Файлы ({clientFiles.length})
                      </TabsTrigger>
                      <TabsTrigger value="cameras" className="text-xs">
                        Камеры ({clientCameras.length})
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="text-xs">
                        Заметки ({clientNotes.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-3 space-y-3">
                      {clientProject ? (
                        <div className="grid grid-cols-2 gap-3">
                          <Card className="col-span-2">
                            <div className="flex gap-4 p-3">
                              {clientProject.cover_image ? (
                                <img
                                  src={clientProject.cover_image}
                                  alt=""
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                                  <Building2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium">{clientProject.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {clientProject.description?.slice(0, 100)}...
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {clientProject.areavalue} м²
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {clientProject.pricevalue
                                      ? `${(clientProject.pricevalue / 1000000).toFixed(1)} млн ₽`
                                      : "Цена не указана"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3">
                            <p className="text-xs text-muted-foreground">Прогресс</p>
                            <Progress value={clientProject.progress || 0} className="mt-2" />
                            <p className="text-xs mt-1">{clientProject.progress || 0}%</p>
                          </Card>
                          <Card className="p-3">
                            <p className="text-xs text-muted-foreground">Статус</p>
                            <p className="text-sm font-medium mt-1">
                              {clientProject.status || "В разработке"}
                            </p>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Проект не назначен</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="h-3 w-3 mr-1" />
                            Создать проект
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* Project Tab */}
                    <TabsContent value="project" className="mt-3 space-y-3">
                      {clientProject ? (
                        <div className="space-y-3">
                          <Card className="overflow-hidden">
                            {clientProject.cover_image && (
                              <img
                                src={clientProject.cover_image}
                                alt=""
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg">{clientProject.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {clientProject.description}
                              </p>
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-xs text-muted-foreground">Площадь</p>
                                  <p className="font-medium">{clientProject.areavalue} м²</p>
                                </div>
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-xs text-muted-foreground">Стоимость</p>
                                  <p className="font-medium">
                                    {clientProject.pricevalue
                                      ? `${(clientProject.pricevalue / 1000000).toFixed(1)} млн ₽`
                                      : "—"}
                                  </p>
                                </div>
                                {clientProject.address && (
                                  <div className="col-span-2 p-2 bg-muted rounded flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm">{clientProject.address}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" className="gap-1">
                                  <FileText className="h-3 w-3" />
                                  PDF проекта
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Box className="h-3 w-3" />
                                  3D BIMx
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  Открыть
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Проект не назначен</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files" className="mt-3 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          id={`file-upload-${client.id}`}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const uploaded = await fileService.uploadFile(
                                client.id,
                                file,
                                "documents",
                                user.id,
                                user.username
                              );
                              if (uploaded) {
                                toast({ title: "Файл загружен" });
                                const files = await fileService.getClientFiles(client.id, "documents");
                                const contracts = await fileService.getClientFiles(client.id, "contracts");
                                setClientFiles([...files, ...contracts]);
                              } else {
                                toast({ title: "Ошибка загрузки файла", variant: "destructive" });
                              }
                            } catch (err: any) {
                              toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`file-upload-${client.id}`}
                          className="cursor-pointer"
                        >
                          <Button variant="outline" size="sm" className="gap-1" asChild>
                            <span>
                              <Upload className="h-3 w-3" />
                              Загрузить файл
                            </span>
                          </Button>
                        </Label>
                      </div>
                      {clientFiles.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Нет файлов
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {clientFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              {file.mime_type?.startsWith("image/") ? (
                                <FileImage className="h-8 w-8 text-blue-500" />
                              ) : file.mime_type?.includes("pdf") ? (
                                <FileText className="h-8 w-8 text-red-500" />
                              ) : (
                                <FileIcon className="h-8 w-8 text-gray-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(file.created_at).toLocaleDateString("ru-RU")}
                                  {file.uploaded_by_name && ` • ${file.uploaded_by_name}`}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => window.open(fileService.getFileUrl(file), "_blank")}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeleteFile(file.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Cameras Tab */}
                    <TabsContent value="cameras" className="mt-3 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Название камеры"
                          value={newCamera.title}
                          onChange={(e) =>
                            setNewCamera((p) => ({ ...p, title: e.target.value }))
                          }
                          className="flex-1 text-sm"
                        />
                        <Input
                          placeholder="Расположение"
                          value={newCamera.location}
                          onChange={(e) =>
                            setNewCamera((p) => ({ ...p, location: e.target.value }))
                          }
                          className="flex-1 text-sm"
                        />
                        <Button size="sm" onClick={handleAddCamera}>
                          <Plus className="h-3 w-3 mr-1" />
                          Добавить
                        </Button>
                      </div>
                      {newCamera.title && (
                        <div className="space-y-2">
                          <Input
                            placeholder="URL встраивания (iframe)"
                            value={newCamera.embedUrl}
                            onChange={(e) =>
                              setNewCamera((p) => ({ ...p, embedUrl: e.target.value }))
                            }
                            className="text-sm"
                          />
                          <Input
                            placeholder="Прямая ссылка на поток"
                            value={newCamera.streamUrl}
                            onChange={(e) =>
                              setNewCamera((p) => ({ ...p, streamUrl: e.target.value }))
                            }
                            className="text-sm"
                          />
                        </div>
                      )}
                      {clientCameras.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Камеры не добавлены
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {clientCameras.map((camera) => (
                            <Card key={camera.id} className="overflow-hidden">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Camera className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-sm">{camera.title}</span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        camera.isOnline
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      )}
                                    >
                                      {camera.isOnline ? "Онлайн" : "Офлайн"}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => handleDeleteCamera(camera.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                {camera.location && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3 inline mr-1" />
                                    {camera.location}
                                  </p>
                                )}
                                {camera.embedUrl && (
                                  <div className="mt-2 aspect-video bg-black rounded-lg overflow-hidden">
                                    <iframe
                                      src={camera.embedUrl}
                                      className="w-full h-full"
                                      allow="autoplay; fullscreen"
                                      sandbox="allow-same-origin allow-scripts"
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="mt-3 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Новая заметка..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="flex-1 text-sm"
                          onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                        />
                        <Button size="sm" onClick={handleAddNote}>
                          <Plus className="h-3 w-3 mr-1" />
                          Добавить
                        </Button>
                      </div>
                      {clientNotes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Нет заметок
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {clientNotes.map((note) => (
                            <div
                              key={note.id}
                              className="p-3 rounded-lg border bg-muted/30 group"
                            >
                              <p className="text-sm">{note.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(note.created_at).toLocaleString("ru-RU")}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                  onClick={() => handleDeleteNote(note.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Task Manager Component
  const TaskManager = () => {
    const [newTask, setNewTask] = useState({
      title: "",
      description: "",
      priority: "medium" as const,
      due_date: "",
      client_id: "",
    });
    const [showAddTask, setShowAddTask] = useState(false);

    const handleAddTask = async () => {
      if (!newTask.title.trim()) return;
      try {
        const { error } = await db.from("tasks").insert({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          client_id: newTask.client_id || null,
          assigned_to: user.id,
          created_by: user.id,
          status: "pending",
        });
        if (!error) {
          toast({ title: "Задача создана" });
          setNewTask({
            title: "",
            description: "",
            priority: "medium",
            due_date: "",
            client_id: "",
          });
          setShowAddTask(false);
          loadTasks();
        }
      } catch (err: any) {
        toast({ title: "Ошибка", description: err.message, variant: "destructive" });
      }
    };

    const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await db
        .from("tasks")
        .update({
          status: newStatus,
          completed_date: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", taskId);
      loadTasks();
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Задачи</h2>
          <Button size="sm" onClick={() => setShowAddTask(!showAddTask)}>
            <Plus className="h-4 w-4 mr-1" />
            Новая задача
          </Button>
        </div>

        {showAddTask && (
          <Card className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Название задачи"
                value={newTask.title}
                onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
              />
              <Input
                placeholder="Описание"
                value={newTask.description}
                onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={newTask.priority}
                  onValueChange={(v) => setNewTask((p) => ({ ...p, priority: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="urgent">Срочный</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask((p) => ({ ...p, due_date: e.target.value }))}
                />
                <Select
                  value={newTask.client_id}
                  onValueChange={(v) => setNewTask((p) => ({ ...p, client_id: v === "none" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Клиент (необязательно)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без клиента</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTask}>Создать</Button>
                <Button variant="outline" onClick={() => setShowAddTask(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                task.status === "completed" && "opacity-50 bg-muted"
              )}
            >
              <button
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  task.status === "completed"
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 hover:border-primary"
                )}
                onClick={() => toggleTaskStatus(task.id, task.status)}
              >
                {task.status === "completed" && <CheckCircle className="h-3.5 w-3.5" />}
              </button>
              <div className="flex-1">
                <p className={cn("font-medium", task.status === "completed" && "line-through")}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                )}
                {task.client_id && (
                  <p className="text-xs text-blue-600">
                    {clients.find((c) => c.id === task.client_id)?.username}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={cn("text-xs", PRIORITY_COLORS[task.priority])}>
                {task.priority === "low" && "Низкий"}
                {task.priority === "medium" && "Средний"}
                {task.priority === "high" && "Высокий"}
                {task.priority === "urgent" && "Срочный"}
              </Badge>
              {task.due_date && (
                <span
                  className={cn(
                    "text-xs",
                    new Date(task.due_date) < new Date() && task.status !== "completed"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  {new Date(task.due_date).toLocaleDateString("ru-RU")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Requests Manager
  const RequestsManager = () => {
    const handleMarkProcessed = async (id: string) => {
      await db
        .from("form_submissions")
        .update({ processed: true, status: "processed", processed_at: new Date().toISOString() })
        .eq("id", id);
      loadRequests();
      toast({ title: "Заявка обработана" });
    };

    const formLabels: Record<string, string> = {
      contact: "Контакты",
      consultation: "Консультация",
      callback: "Обратный звонок",
      comment: "Комментарий",
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Заявки с сайта
            {stats.newRequests > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{stats.newRequests} новых</Badge>
            )}
          </h2>
          <Button variant="outline" size="sm" onClick={loadRequests}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Обновить
          </Button>
        </div>

        <div className="space-y-3">
          {requests.map((req) => (
            <Card
              key={req.id}
              className={cn(
                "overflow-hidden",
                req.status === "new" && "border-l-4 border-l-blue-500"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={req.status === "new" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {req.status === "new" ? "Новая" : "Обработана"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formLabels[req.form_type] || req.form_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleString("ru-RU")}
                      </span>
                    </div>
                    {req.data && (
                      <div className="text-sm space-y-0.5 mt-2">
                        {req.data.name && <p>Имя: {req.data.name}</p>}
                        {req.data.phone && <p>Телефон: {req.data.phone}</p>}
                        {req.data.email && <p>Email: {req.data.email}</p>}
                        {req.data.message && (
                          <p className="text-muted-foreground">{req.data.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {req.status === "new" && (
                    <Button size="sm" variant="outline" onClick={() => handleMarkProcessed(req.id)}>
                      Обработано
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Dashboard Overview
  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Клиенты</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Новые заявки</p>
              <p className="text-2xl font-bold">{stats.newRequests}</p>
            </div>
            <Bell className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Задачи</p>
              <p className="text-2xl font-bold">{stats.pendingTasks}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Просрочено</p>
              <p className="text-2xl font-bold text-red-500">{stats.overdueTasks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Quick Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Последние заявки
              {stats.newRequests > 0 && (
                <Badge className="bg-red-500 text-white">{stats.newRequests}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.slice(0, 5).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-2 rounded-lg border text-sm"
              >
                <div>
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full mr-2",
                      req.status === "new" ? "bg-blue-500" : "bg-gray-300"
                    )}
                  />
                  {req.data?.name || "Аноним"}
                  {req.data?.phone && ` • ${req.data.phone}`}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Нет заявок</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Активные задачи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks
              .filter((t) => t.status === "pending")
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg border text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        task.priority === "urgent"
                          ? "bg-red-500"
                          : task.priority === "high"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      )}
                    />
                    <span className="truncate max-w-[200px]">{task.title}</span>
                  </div>
                  {task.due_date && (
                    <span
                      className={cn(
                        "text-xs",
                        new Date(task.due_date) < new Date() ? "text-red-500" : "text-muted-foreground"
                      )}
                    >
                      {new Date(task.due_date).toLocaleDateString("ru-RU")}
                    </span>
                  )}
                </div>
              ))}
            {tasks.filter((t) => t.status === "pending").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Нет активных задач</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Личный кабинет менеджера</h1>
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { id: "dashboard", label: "Дашборд", icon: LayoutGrid },
                  { id: "clients", label: "Клиенты", icon: Users },
                  { id: "tasks", label: "Задачи", icon: CheckCircle },
                  { id: "requests", label: "Заявки", icon: ClipboardList },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {tab.id === "requests" && stats.newRequests > 0 && (
                      <Badge className="ml-1 bg-red-500 text-white text-[10px] px-1.5">
                        {stats.newRequests}
                      </Badge>
                    )}
                  </Button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">Менеджер</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b p-2">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: "dashboard", label: "Дашборд", icon: LayoutGrid },
            { id: "clients", label: "Клиенты", icon: Users },
            { id: "tasks", label: "Задачи", icon: CheckCircle },
            { id: "requests", label: "Заявки", icon: ClipboardList },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 gap-1"
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && <DashboardOverview />}
            {activeTab === "clients" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск клиентов..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={loadClients}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Клиенты не найдены</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "tasks" && <TaskManager />}
            {activeTab === "requests" && <RequestsManager />}
          </>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
