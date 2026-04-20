import React, { useState } from "react";
import { User } from "@/services/types/authTypes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  TrendingUp,
  CalendarDays,
  Images,
  Video,
  FolderOpen,
  Send,
  Home,
  MessageSquare,
  Share2,
  Info,
  LogOut,
} from "lucide-react";
import ClientRequests from "@/components/client/ClientRequests";
import ClientDocumentsV2 from "@/components/client/ClientDocumentsV2";
import ClientTelegramSettings from "@/components/client/ClientTelegramSettings";
import ClientProgress from "@/components/client/ClientProgress";
import ClientSchedule from "@/components/client/ClientSchedule";
import ClientPhotoGallery from "@/components/client/ClientPhotoGallery";
import ClientCameraView from "@/components/client/ClientCameraView";
import ClientProfile from "@/components/client/ClientProfile";
import ClientFeed from "@/components/client/ClientFeed";
import GuestAccess from "@/components/client/GuestAccess";
import HouseInfo from "@/components/client/HouseInfo";
import { db } from "@/integrations/db/client";
import ClientProjectView from "@/components/client/ClientProjectView";

type TabId = "feed" | "project" | "house" | "profile" | "requests" | "progress" | "schedule" | "gallery" | "cameras" | "documents" | "guest" | "telegram";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: boolean;
}> = [
  { id: "feed", label: "Лента", icon: MessageSquare, badge: true },
  { id: "project", label: "Проект", icon: Home },
  { id: "house", label: "Паспорт дома", icon: Info },
  { id: "profile", label: "Профиль", icon: FileText },
  { id: "requests", label: "Заявки", icon: Send },
  { id: "progress", label: "Прогресс", icon: TrendingUp },
  { id: "schedule", label: "График", icon: CalendarDays },
  { id: "gallery", label: "Фото", icon: Images },
  { id: "cameras", label: "Камеры", icon: Video },
  { id: "documents", label: "Документы", icon: FolderOpen },
  { id: "guest", label: "Гостевой доступ", icon: Share2 },
  { id: "telegram", label: "Telegram", icon: Send },
];

interface ClientDashboardProps {
  user: User;
  onLogout?: (e: React.MouseEvent) => void;
}

function renderContent(tab: TabId, user: User) {
  switch (tab) {
    case "feed":
      return <ClientFeed user={user} />;
    case "project":
      return <ClientProjectView user={user} />;
    case "house":
      return <HouseInfo user={user} />;
    case "profile":
      return <ClientProfile user={user} />;
    case "requests":
      return <ClientRequests user={user} />;
    case "progress":
      return <ClientProgress user={user} />;
    case "schedule":
      return <ClientSchedule user={user} />;
    case "gallery":
      return <ClientPhotoGallery user={user} />;
    case "cameras":
      return <ClientCameraView user={user} />;
    case "documents":
      return <ClientDocumentsV2 user={user} />;
    case "guest":
      return <GuestAccess user={user} />;
    case "telegram":
      return <ClientTelegramSettings user={user} />;
    default:
      return <ClientFeed user={user} />;
  }
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="flex flex-col md:flex-row min-h-[600px]">
      {/* ── Sidebar (desktop only) ── */}
      <aside className="hidden md:flex flex-col w-52 flex-shrink-0 border-r bg-muted/20 min-h-full">
        {/* Профиль */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user.username}</p>
              {user.clientStage && (
                <Badge variant="outline" className="text-xs mt-0.5 truncate max-w-full">
                  {user.clientStage}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative",
                activeTab === id
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge && unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        {onLogout && (
          <div className="p-2 border-t">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Выйти
            </button>
          </div>
        )}
      </aside>

      {/* ── Mobile nav ── */}
      <div className="md:hidden border-b">
        <div className="flex overflow-x-auto scrollbar-none">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-3 flex-shrink-0 transition-all border-b-2 min-w-[70px]",
                activeTab === id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:bg-muted",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] whitespace-nowrap leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ── */}
      <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
        {renderContent(activeTab, user)}
      </main>
    </div>
  );
};

export default ClientDashboard;
