
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import CategoryForm from "./CategoryForm";
import { CategoryFormData } from "./types";

interface AddCategoryDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formData: CategoryFormData;
  isLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTypeChange: (value: string) => void;
  handleCreateCategory: () => Promise<void>;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  isOpen,
  setIsOpen,
  formData,
  isLoading,
  handleChange,
  handleTypeChange,
  handleCreateCategory
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Добавить категорию
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить новую категорию</DialogTitle>
        </DialogHeader>
        <CategoryForm 
          formData={formData}
          onChange={handleChange}
          onTypeChange={handleTypeChange}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
          <Button onClick={handleCreateCategory} disabled={isLoading}>
            {isLoading ? "Создание..." : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
