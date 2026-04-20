import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/services/types/authTypes";
import { db } from "@/integrations/db/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Share2,
  Copy,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Clock,
  Link as LinkIcon,
  CheckCircle,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestAccessProps {
  user: User;
}

interface GuestLink {
  id: string;
  token: string;
  name: string;
  expires_at?: string;
  created_at: string;
  access_level: "full" | "photos_only" | "progress_only";
  is_active: boolean;
  visits_count: number;
}

const ACCESS_LEVELS = {
  full: {
    label: "Полный доступ",
    description: "Все разделы личного кабинета",
    icon: Eye,
    color: "bg-green-100 text-green-700",
  },
  photos_only: {
    label: "Только фото",
    description: "Галерея и фотоотчёты",
    icon: Eye,
    color: "bg-blue-100 text-blue-700",
  },
  progress_only: {
    label: "Только прогресс",
    description: "Ход строительства",
    icon: Eye,
    color: "bg-amber-100 text-amber-700",
  },
};

const GuestAccess: React.FC<GuestAccessProps> = ({ user }) => {
  const [guestLinks, setGuestLinks] = useState<GuestLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLink, setNewLink] = useState({
    name: "",
    access_level: "photos_only" as const,
    expires_days: "7",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_BASE ?? "";

  useEffect(() => {
    loadGuestLinks();
  }, []);

  const loadGuestLinks = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE ?? "";
      const token = localStorage.getItem("mongo_auth_token") ?? "";
      const res = await fetch(
        `${API_BASE}/api/client/${user.id}/guest-links`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const json = await res.json();
      if (json.data) {
        setGuestLinks(json.data as GuestLink[]);
      }
    } catch (err) {
      console.error("Error loading guest links:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateLink = async () => {
    if (!newLink.name.trim()) {
      toast({ title: "Укажите название", variant: "destructive" });
      return;
    }

    try {
      const expiresAt = newLink.expires_days
        ? new Date(Date.now() + parseInt(newLink.expires_days) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const API_BASE = import.meta.env.VITE_API_BASE ?? "";
      const token = localStorage.getItem("mongo_auth_token") ?? "";
      const res = await fetch(
        `${API_BASE}/api/client/${user.id}/guest-links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: newLink.name,
            access_level: newLink.access_level,
            expires_at: expiresAt,
          }),
        }
      );
      const json = await res.json();
      if (json.data) {
        setGuestLinks([json.data as GuestLink, ...guestLinks]);
        setNewLink({ name: "", access_level: "photos_only", expires_days: "7" });
        setShowCreateForm(false);
        toast({ title: "Ссылка создана" });
      }
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Удалить ссылку? Гости больше не смогут получить доступ.")) return;

    try {
      await db.from("guest_access_links").delete().eq("id", id);
      setGuestLinks(guestLinks.filter((l) => l.id !== id));
      toast({ title: "Ссылка удалена" });
    } catch (err) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const handleToggleActive = async (link: GuestLink) => {
    try {
      await db
        .from("guest_access_links")
        .update({ is_active: !link.is_active })
        .eq("id", link.id);
      setGuestLinks(
        guestLinks.map((l) =>
          l.id === link.id ? { ...l, is_active: !l.is_active } : l
        )
      );
      toast({ title: link.is_active ? "Ссылка отключена" : "Ссылка включена" });
    } catch (err) {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const copyToClipboard = (token: string, id: string) => {
    const url = `${window.location.origin}/guest/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Ссылка скопирована" });
  };

  const isExpired = (link: GuestLink) => {
    if (!link.expires_at) return false;
    return new Date(link.expires_at) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Гостевой доступ</h2>
          <p className="text-sm text-muted-foreground">
            Делитесь ходом строительства с близкими
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Создать ссылку
        </Button>
      </div>

      {/* Info card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Share2 className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-blue-900">Как это работает?</p>
            <p className="text-sm text-blue-700 mt-1">
              Создайте ссылку и отправьте её родным, друзьям или подрядчикам. 
              Они смогут видеть выбранные вами разделы без регистрации. 
              Вы можете ограничить доступ в любой момент.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Новая ссылка</CardTitle>
                <CardDescription>Кому вы даёте доступ?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Название (например: "Для мамы", "Дизайнер")</Label>
                  <Input
                    placeholder="Для кого эта ссылка"
                    value={newLink.name}
                    onChange={(e) => setNewLink((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Уровень доступа</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(ACCESS_LEVELS).map(([key, config]) => (
                      <div
                        key={key}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          newLink.access_level === key
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        )}
                        onClick={() =>
                          setNewLink((p) => ({ ...p, access_level: key as any }))
                        }
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <config.icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{config.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Срок действия</Label>
                  <select
                    className="w-full mt-1.5 rounded-md border px-3 py-2 text-sm"
                    value={newLink.expires_days}
                    onChange={(e) =>
                      setNewLink((p) => ({ ...p, expires_days: e.target.value }))
                    }
                  >
                    <option value="1">1 день</option>
                    <option value="7">7 дней</option>
                    <option value="30">30 дней</option>
                    <option value="90">3 месяца</option>
                    <option value="">Без ограничений</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateLink}>Создать</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : guestLinks.length === 0 ? (
        <Card className="p-12 text-center">
          <Share2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Ссылок пока нет</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowCreateForm(true)}
          >
            Создать первую ссылку
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {guestLinks.map((link) => {
            const accessConfig = ACCESS_LEVELS[link.access_level];
            const expired = isExpired(link);

            return (
              <Card
                key={link.id}
                className={cn(
                  "overflow-hidden",
                  !link.is_active && "opacity-60",
                  expired && "border-red-200"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{link.name}</h4>
                        {expired && (
                          <Badge variant="destructive" className="text-xs">
                            Истекла
                          </Badge>
                        )}
                        {!link.is_active && !expired && (
                          <Badge variant="secondary" className="text-xs">
                            Отключена
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className={cn("px-2 py-0.5 rounded text-xs", accessConfig.color)}>
                          {accessConfig.label}
                        </span>
                        <span>•</span>
                        <span>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {link.expires_at
                            ? new Date(link.expires_at).toLocaleDateString("ru-RU")
                            : "Бессрочно"}
                        </span>
                        <span>•</span>
                        <span>
                          <Users className="h-3 w-3 inline mr-1" />
                          {link.visits_count} просмотров
                        </span>
                      </div>

                      {/* URL */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono truncate">
                          {window.location.origin}/guest/{link.token}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => copyToClipboard(link.token, link.id)}
                        >
                          {copiedId === link.id ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={link.is_active && !expired}
                          onCheckedChange={() => handleToggleActive(link)}
                          disabled={expired}
                        />
                        <span className="text-xs">
                          {link.is_active && !expired ? "Активна" : "Отключена"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuestAccess;
