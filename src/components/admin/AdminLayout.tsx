import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@/services/types/authTypes";
import {
  FileText,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Users,
  Bell,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { db } from "@/integrations/db/client";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/account/", icon: LayoutDashboard, label: "Дашборд", roles: ["admin", "manager"] },
  { to: "/account/projects", icon: Home, label: "Проекты", roles: ["admin", "editor", "manager"] },
  { to: "/account/gallery", icon: Image, label: "Галерея", roles: ["admin", "editor"] },
  { to: "/account/moderation", icon: FileText, label: "Контент", roles: ["admin", "editor"] },
  { to: "/account/forms", icon: MessageSquare, label: "Заявки", roles: ["admin", "manager"] },
  { to: "/account/news", icon: Newspaper, label: "Новости", roles: ["admin", "editor", "manager"] },
  { to: "/account/users", icon: Users, label: "Пользователи", roles: ["admin"] },
];

const ROLE_NAMES: Record<string, string> = {
  admin: "Администратор",
  editor: "Редактор",
  manager: "Менеджер",
  client: "Клиент",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "from-violet-500 to-purple-600",
  editor: "from-blue-500 to-cyan-600",
  manager: "from-emerald-500 to-teal-600",
};

function getInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

interface Notification {
  id: string;
  type: "request" | "task" | "system";
  message: string;
  time: string;
  read: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: (e: React.MouseEvent) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const role = Array.isArray(user.role) ? user.role[0] : user.role;
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role || "client"));
  const gradientClass = ROLE_COLORS[role || "admin"] || ROLE_COLORS.admin;
  const initials = getInitials(user.username ?? "А");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: newForms } = await db
        .from("form_submissions")
        .select("id, created_at")
        .eq("status", "new")
        .limit(5);

      const notifs: Notification[] = (newForms || []).map((f: any) => ({
        id: f.id,
        type: "request" as const,
        message: "Новая заявка с сайта",
        time: f.created_at,
        read: false,
      }));

      setNotifications(notifs);
    } catch {
      // table might not exist yet
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const NavContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="px-4 py-5 border-b">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br",
              gradientClass,
            )}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {ROLE_NAMES[role || "client"] || role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.to === "/account/forms" && unreadCount > 0 && (
                <Badge className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={(e) => {
            onNavigate?.();
            onLogout(e);
          }}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background flex-shrink-0">
        <NavContent />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
          <div className="flex items-center justify-between px-4 md:px-6 h-14">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <NavContent onNavigate={() => setSheetOpen(false)} />
                </SheetContent>
              </Sheet>
              <h1 className="text-sm font-medium text-muted-foreground hidden md:block">
                Панель управления
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9" : unreadCount}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-xl shadow-xl z-50">
                    <div className="flex items-center justify-between p-3 border-b">
                      <span className="font-medium text-sm">Уведомления</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                            Прочитать все
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNotifications(false)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Нет уведомлений</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              "flex items-start gap-3 p-3 border-b last:border-0",
                              !n.read && "bg-primary/5"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              n.type === "request" ? "bg-orange-100" : "bg-blue-100"
                            )}>
                              {n.type === "request" ? (
                                <MessageSquare className="h-4 w-4 text-orange-600" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(n.time).toLocaleString("ru-RU", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar (mobile) */}
              <div className="md:hidden flex items-center gap-2">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br",
                    gradientClass,
                  )}
                >
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
