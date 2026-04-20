import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/services/types/authTypes";
import { db } from "@/integrations/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Send,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  User as UserIcon,
  HardHat,
  Calendar,
  MessageSquare,
  MoreVertical,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientFeedProps {
  user: User;
}

interface FeedItem {
  id: string;
  type: "message" | "photo" | "document" | "stage_update" | "payment" | "approval";
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  attachments?: {
    id: string;
    type: "image" | "document" | "video";
    url: string;
    name: string;
    thumbnail?: string;
  }[];
  metadata?: {
    stageName?: string;
    stageStatus?: "started" | "completed" | "approved";
    paymentAmount?: number;
    paymentStatus?: "pending" | "paid";
    documentName?: string;
  };
  created_at: string;
  likes?: number;
  comments?: number;
}

const ROLE_COLORS: Record<string, string> = {
  manager: "bg-blue-100 text-blue-700",
  engineer: "bg-green-100 text-green-700",
  foreman: "bg-orange-100 text-orange-700",
  client: "bg-primary/10 text-primary",
  admin: "bg-purple-100 text-purple-700",
};

const ROLE_LABELS: Record<string, string> = {
  manager: "Менеджер",
  engineer: "Инженер",
  foreman: "Прораб",
  client: "Клиент",
  admin: "Админ",
};

const ClientFeed: React.FC<ClientFeedProps> = ({ user }) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeed();
  }, [user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [feedItems]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadFeed = async () => {
    try {
      const { data, error } = await db
        .from("client_feed")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setFeedItems(data as FeedItem[]);
      }
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedImages.length === 0) return;

    try {
      // Upload images if any
      const attachments = [];
      for (const image of selectedImages) {
        const fileName = `feed-${user.id}-${Date.now()}-${image.name}`;
        const { data: uploadData, error: uploadError } = await db.storage
          .from("client-feed")
          .upload(fileName, image);

        if (!uploadError && uploadData) {
          const { data: urlData } = db.storage
            .from("client-feed")
            .getPublicUrl(fileName);
          attachments.push({
            id: Math.random().toString(36).substr(2, 9),
            type: "image" as const,
            url: urlData.publicUrl,
            name: image.name,
          });
        }
      }

      // Create feed item
      const { error } = await db.from("client_feed").insert({
        client_id: user.id,
        type: selectedImages.length > 0 ? "photo" : "message",
        content: newMessage,
        author: {
          id: user.id,
          name: user.username,
          role: "client",
        },
        attachments: attachments.length > 0 ? attachments : [],
        metadata: {},
      });

      if (!error) {
        setNewMessage("");
        setSelectedImages([]);
        loadFeed();
        toast({ title: "Сообщение отправлено" });
      }
    } catch (err: any) {
      toast({ title: "Ошибка отправки", description: err.message, variant: "destructive" });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderFeedItem = (item: FeedItem) => {
    const isExpanded = expandedItems.has(item.id);
    const isStageUpdate = item.type === "stage_update";
    const isPayment = item.type === "payment";
    const isApproval = item.type === "approval";

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "mb-4",
          item.author.role === "client" ? "ml-8" : "mr-8"
        )}
      >
        <Card
          className={cn(
            "overflow-hidden",
            item.author.role === "client" && "border-primary/20 bg-primary/5"
          )}
        >
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className={cn(
                      "text-sm font-semibold",
                      ROLE_COLORS[item.author.role] || "bg-gray-100"
                    )}
                  >
                    {item.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{item.author.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", ROLE_COLORS[item.author.role])}
                    >
                      {ROLE_LABELS[item.author.role] || item.author.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Type badge */}
              {isStageUpdate && (
                <Badge className="bg-blue-100 text-blue-700">
                  <HardHat className="h-3 w-3 mr-1" />
                  Этап
                </Badge>
              )}
              {isPayment && (
                <Badge className="bg-green-100 text-green-700">
                  <FileText className="h-3 w-3 mr-1" />
                  Оплата
                </Badge>
              )}
              {isApproval && (
                <Badge className="bg-purple-100 text-purple-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Принятие
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Content */}
            {item.content && (
              <p className="text-sm whitespace-pre-wrap mb-3">{item.content}</p>
            )}

            {/* Stage update metadata */}
            {isStageUpdate && item.metadata && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <HardHat className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">{item.metadata.stageName}</span>
                </div>
                <Badge
                  className={cn(
                    item.metadata.stageStatus === "completed" && "bg-green-100 text-green-700",
                    item.metadata.stageStatus === "started" && "bg-blue-100 text-blue-700",
                    item.metadata.stageStatus === "approved" && "bg-purple-100 text-purple-700"
                  )}
                >
                  {item.metadata.stageStatus === "completed" && "Завершён"}
                  {item.metadata.stageStatus === "started" && "Начат"}
                  {item.metadata.stageStatus === "approved" && "Принят"}
                </Badge>
              </div>
            )}

            {/* Payment metadata */}
            {isPayment && item.metadata && (
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">
                      {item.metadata.paymentAmount?.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                  <Badge
                    className={
                      item.metadata.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {item.metadata.paymentStatus === "paid" ? "Оплачено" : "Ожидает"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {item.attachments.map((att) => (
                  <div key={att.id} className="relative">
                    {att.type === "image" ? (
                      <div
                        className={cn(
                          "relative rounded-lg overflow-hidden cursor-pointer",
                          !isExpanded && "max-h-64"
                        )}
                        onClick={() => toggleExpand(att.id)}
                      >
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-full object-cover"
                        />
                        {!isExpanded && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
                            <Button variant="secondary" size="sm" className="gap-1">
                              <ChevronDown className="h-3 w-3" />
                              Раскрыть
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : att.type === "document" ? (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <FileText className="h-8 w-8 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{att.name}</p>
                          <p className="text-xs text-muted-foreground">Документ</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {item.comments || 0}
              </Button>
              <span className="text-xs text-muted-foreground">
                {item.likes ? `${item.likes} лайков` : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-140px)]">
      {/* Feed list */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Лента пока пуста</p>
            <p className="text-sm text-muted-foreground">
              Здесь будут появляться сообщения от менеджера, фото со стройки и обновления этапов
            </p>
          </div>
        ) : (
          <>
            {feedItems.map(renderFeedItem)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="border-t bg-white p-4 space-y-3">
        {selectedImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {selectedImages.map((file, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-16 w-16 object-cover rounded-lg"
                />
                <button
                  onClick={() =>
                    setSelectedImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setSelectedImages((prev) => [...prev, ...files]);
            }}
          />
          <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Input
            placeholder="Напишите сообщение менеджеру..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            className="flex-1"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && selectedImages.length === 0}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Нажмите Enter для отправки, Shift+Enter для новой строки
        </p>
      </div>
    </div>
  );
};

export default ClientFeed;
