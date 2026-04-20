
import React from "react";
import { Category } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  categoryToDelete: Category | null;
  handleDeleteCategory: () => Promise<void>;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
  categoryToDelete,
  handleDeleteCategory
}) => {
  // Уникальные идентификаторы для ARIA атрибутов
  const dialogTitleId = "category-delete-title";
  const dialogDescriptionId = "category-delete-description";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Название</th>
            <th scope="col" className="px-6 py-3">Тип</th>
            <th scope="col" className="px-6 py-3">Описание</th>
            <th scope="col" className="px-6 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center">Загрузка...</td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center">Категории не найдены</td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4">
                  {category.type === 'project' ? 'Проекты' : 
                   category.type === 'blog' ? 'Блог' : 'Новости'}
                </td>
                <td className="px-6 py-4">{category.description || "-"}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => onDelete(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        aria-labelledby={dialogTitleId}
                        aria-describedby={dialogDescriptionId}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle id={dialogTitleId}>Вы уверены?</AlertDialogTitle>
                          <AlertDialogDescription id={dialogDescriptionId}>
                            Эта операция нельзя отменить. Категория будет удалена навсегда.
                            {categoryToDelete?.name && (
                              <span className="font-semibold block mt-2">
                                Категория: {categoryToDelete.name}
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => onDelete(null)}>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? "Удаление..." : "Удалить"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
