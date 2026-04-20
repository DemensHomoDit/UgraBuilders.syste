
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import CategoryForm from "./CategoryForm";
import { CategoryFormData } from "./types";

interface EditCategoryDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formData: CategoryFormData;
  isLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTypeChange: (value: string) => void;
  handleUpdateCategory: () => Promise<void>;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  setIsOpen,
  formData,
  isLoading,
  handleChange,
  handleTypeChange,
  handleUpdateCategory
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать категорию</DialogTitle>
        </DialogHeader>
        <CategoryForm 
          formData={formData}
          onChange={handleChange}
          onTypeChange={handleTypeChange}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
          <Button onClick={handleUpdateCategory} disabled={isLoading}>
            {isLoading ? "Обновление..." : "Обновить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
