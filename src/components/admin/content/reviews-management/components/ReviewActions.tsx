import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, Send, Check, X } from "lucide-react";
import { Review } from "@/services/review/types";

interface ReviewActionsProps {
  review: Review;
  onEditClick: (review: Review) => void;
  onDeleteClick: (review: Review) => void;
  onSendToReview?: (review: Review) => void;
  onRevoke?: (review: Review) => void;
  onApprove?: (review: Review) => void;
  onReject?: (review: Review) => void;
  isAdmin?: boolean;
}

const ReviewActions: React.FC<ReviewActionsProps> = ({
  review,
  onEditClick,
  onDeleteClick,
  onSendToReview,
  onRevoke,
  onApprove,
  onReject,
  isAdmin = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label="Открыть меню"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditClick(review)}>
          <Edit className="mr-2 h-4 w-4" />
          Редактировать
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteClick(review)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить
        </DropdownMenuItem>
        {/* Workflow actions */}
        {review.status === "draft" && onSendToReview && (
          <DropdownMenuItem onClick={() => onSendToReview(review)}>
            <Send className="mr-2 h-4 w-4" />
            На модерацию
          </DropdownMenuItem>
        )}
        {review.status === "pending" && onRevoke && (
          <DropdownMenuItem onClick={() => onRevoke(review)}>
            <X className="mr-2 h-4 w-4" />
            Отозвать
          </DropdownMenuItem>
        )}
        {review.status === "rejected" && onSendToReview && (
          <DropdownMenuItem onClick={() => onSendToReview(review)}>
            <Send className="mr-2 h-4 w-4" />
            Повторно отправить
          </DropdownMenuItem>
        )}
        {isAdmin && review.status === "pending" && (
          <>
            {onApprove && (
              <DropdownMenuItem onClick={() => onApprove(review)}>
                <Check className="mr-2 h-4 w-4" />
                Одобрить
              </DropdownMenuItem>
            )}
            {onReject && (
              <DropdownMenuItem onClick={() => onReject(review)}>
                <X className="mr-2 h-4 w-4" />
                Отклонить
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReviewActions;
