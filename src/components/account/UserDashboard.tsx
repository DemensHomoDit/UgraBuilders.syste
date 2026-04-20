import { useNavigate } from "react-router-dom";
import { User } from "@/services/types/authTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FolderOpen,
  Images,
  BookOpen,
  MessageSquare,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";
import ClientDashboard from "@/components/client/ClientDashboard";
import ManagerDashboard from "@/components/manager/ManagerDashboard";

interface UserDashboardProps {
  user: User;
  onLogout: (e: React.MouseEvent) => Promise<void>;
}

interface NavCard {
  label: string;
  desc: string;
  icon: React.ElementType;
  to: string;
  color: string;
}

const ADMIN_CARDS: NavCard[] = [
  {
    label: "Дашборд",
    desc: "Статистика и сводка",
    icon: LayoutDashboard,
    to: "/account",
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Проекты",
    desc: "Управление каталогом",
    icon: FolderOpen,
    to: "/account/projects",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Галерея",
    desc: "Изображения и медиа",
    icon: Images,
    to: "/account/gallery",
    color: "bg-violet-100 text-violet-600",
  },
  {
    label: "Контент",
    desc: "Блог, отзывы, категории",
    icon: BookOpen,
    to: "/account/moderation",
    color: "bg-orange-100 text-orange-600",
  },
  {
    label: "Заявки",
    desc: "CRM и формы",
    icon: MessageSquare,
    to: "/account/forms",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    label: "Пользователи",
    desc: "Аккаунты и роли",
    icon: Users,
    to: "/account/users",
    color: "bg-rose-100 text-rose-600",
  },
];

const EDITOR_CARDS: NavCard[] = [
  {
    label: "Проекты",
    desc: "Управление каталогом",
    icon: FolderOpen,
    to: "/account/projects",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Галерея",
    desc: "Загрузка и управление фотографиями",
    icon: Images,
    to: "/account/gallery",
    color: "bg-violet-100 text-violet-600",
  },
  {
    label: "Контент",
    desc: "Блог, отзывы, категории",
    icon: BookOpen,
    to: "/account/moderation",
    color: "bg-orange-100 text-orange-600",
  },
];

const getRoleName = (role: string): string => {
  const names: Record<string, string> = {
    admin: "Администратор",
    editor: "Редактор",
    manager: "Менеджер",
    client: "Клиент",
  };
  return names[role] ?? role;
};

const getRoleBadgeVariant = (
  role: string,
): "default" | "secondary" | "outline" => {
  if (role === "admin") return "default";
  if (role === "editor") return "secondary";
  return "outline";
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length > 1) {
    return parts
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const UserDashboard = ({ user, onLogout }: UserDashboardProps) => {
  const navigate = useNavigate();

  const cards =
    user.role === "admin"
      ? ADMIN_CARDS
      : user.role === "editor"
        ? EDITOR_CARDS
        : [];

  return (
    <div>
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-lg font-bold select-none shrink-0">
              {getInitials(user.username)}
            </div>
            <div>
              <h2 className="text-xl font-semibold leading-tight">
                {user.username}
              </h2>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleName(user.role)}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="shrink-0"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Navigation card grid (admin / editor) */}
      {cards.length > 0 && (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.to}
                  onClick={() => navigate(card.to)}
                  className="group relative overflow-hidden rounded-xl border bg-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{card.label}</h3>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role-specific dashboards */}
      {user.role === "client" && (
        <div className="pt-4">
          <ClientDashboard user={user} />
        </div>
      )}
      {user.role === "manager" && (
        <div className="pt-4">
          <ManagerDashboard user={user} />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
