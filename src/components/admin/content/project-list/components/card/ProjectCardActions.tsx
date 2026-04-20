import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Edit, Trash2, Send, Check, X } from "lucide-react";

interface ProjectCardActionsProps {
  isPublished: boolean;
  status?: "draft" | "pending" | "published" | "rejected";
  isAdmin?: boolean;
  userRole?: string;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSendToReview?: () => void;
  onRevoke?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  isPublished,
  status = "draft",
  isAdmin = false,
  userRole,
  onTogglePublish,
  onEdit,
  onDelete,
  onSendToReview,
  onRevoke,
  onApprove,
  onReject
}) => {
  // Разделение логики по ролям
  if (userRole === 'admin') {
    // --- Для админа ---
    if (status === 'pending') {
      // Одобрить/Отклонить
      return (
        <div className="p-2 border-t bg-muted/20 flex flex-wrap justify-between gap-1">
          {onApprove && (
            <Button variant="success" size="sm" onClick={onApprove}>
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs">Одобрить</span>
            </Button>
          )}
          {onReject && (
            <Button variant="destructive" size="sm" onClick={onReject}>
              <X className="h-4 w-4 mr-1" />
              <span className="text-xs">Отклонить</span>
            </Button>
          )}
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }
    if (status === 'draft' || status === 'published') {
      // Публикация/скрытие
      return (
        <div className="p-2 border-t bg-muted/20 flex flex-wrap justify-between gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onTogglePublish}
            title={isPublished ? "Снять с публикации" : "Опубликовать"}
            disabled={status !== "published" && status !== "draft"}
          >
            {isPublished ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                <span className="text-xs">Скрыть</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                <span className="text-xs">Показать</span>
              </>
            )}
          </Button>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }
    // rejected — только редактировать/удалить
    return (
      <div className="p-2 border-t bg-muted/20 flex flex-wrap justify-between gap-1">
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  // --- Для редактора ---
  return (
    <div className="p-2 border-t bg-muted/20 flex flex-wrap justify-between gap-1">
      {status === "draft" && onSendToReview && (
        <Button variant="outline" size="sm" onClick={onSendToReview}>
          <Send className="h-4 w-4 mr-1" />
          <span className="text-xs">На подтверждение</span>
        </Button>
      )}
      {status === "pending" && onRevoke && (
        <Button variant="outline" size="sm" onClick={onRevoke}>
          <X className="h-4 w-4 mr-1" />
          <span className="text-xs">Отозвать</span>
        </Button>
      )}
      {status === "rejected" && onSendToReview && (
        <Button variant="outline" size="sm" onClick={onSendToReview}>
          <Send className="h-4 w-4 mr-1" />
          <span className="text-xs">Повторно отправить</span>
        </Button>
      )}
      <div className="flex space-x-1">
        {(status === "draft" || status === "rejected") && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {(status === "draft" || status === "rejected") && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
