import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import newsService from "@/services/news";
import { NewsItem } from "@/services/news/types";
import NewsForm from "./NewsForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewsFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: NewsItem | null;
  onClose: () => void;
  categories: { id: string; name: string }[];
  userId: string;
}

const NewsFormDialog: React.FC<NewsFormDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedNews,
  onClose,
  categories,
  userId,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedNews ? "Редактировать новость" : "Новая новость"}
          </DialogTitle>
        </DialogHeader>
        <NewsForm
          newsItem={selectedNews}
          onSave={onClose}
          onCancel={onClose}
          categories={categories}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewsFormDialog;
