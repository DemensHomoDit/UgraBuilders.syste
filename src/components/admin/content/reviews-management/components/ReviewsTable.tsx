import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Review } from "@/services/review/types";
import ReviewRating from "./ReviewRating";
import ReviewActions from "./ReviewActions";

interface ReviewsTableProps {
  reviews: Review[];
  onEditClick: (review: Review) => void;
  onDeleteClick: (review: Review) => void;
  onSendToReview?: (review: Review) => void;
  onRevoke?: (review: Review) => void;
  onApprove?: (review: Review) => void;
  onReject?: (review: Review) => void;
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({
  reviews,
  onEditClick,
  onDeleteClick,
  onSendToReview,
  onRevoke,
  onApprove,
  onReject
}) => {
  const getProjectName = (review: Review) => {
    if (review.project_id && review.projects) {
      return review.projects.title;
    }
    return "Не указан";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Клиент</TableHead>
            <TableHead>Проект</TableHead>
            <TableHead>Оценка</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="w-[100px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Отзывы не найдены
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">
                  {review.author_name}
                </TableCell>
                <TableCell>{getProjectName(review)}</TableCell>
                <TableCell>
                  <ReviewRating rating={review.rating} />
                </TableCell>
                <TableCell>
                  {review.created_at
                    ? format(new Date(review.created_at), "dd.MM.yyyy")
                    : "Не указана"}
                </TableCell>
                <TableCell>
                  {review.status === 'published' ? (
                    <Badge variant="default">Опубликован</Badge>
                  ) : review.status === 'pending' ? (
                    <Badge variant="secondary">На модерации</Badge>
                  ) : review.status === 'rejected' ? (
                    <Badge variant="destructive">Отклонён</Badge>
                  ) : (
                    <Badge variant="outline">Черновик</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <ReviewActions
                    review={review}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onSendToReview={onSendToReview}
                    onRevoke={onRevoke}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReviewsTable;
