
import React from "react";
import { useCategoryManagement } from "./useCategoryManagement";
import AddCategoryDialog from "./AddCategoryDialog";
import EditCategoryDialog from "./EditCategoryDialog";
import CategoryTable from "./CategoryTable";
import CategoryFilter from "./CategoryFilter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CategoryManagement = () => {
  const {
    categories,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    categoryToEdit,
    categoryToDelete,
    isLoading,
    formData,
    activeFilter,
    handleFilterChange,
    handleChange,
    handleTypeChange,
    handleEditCategory,
    handleDeleteSetup,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory
  } = useCategoryManagement();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление категориями</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> Добавить категорию
        </Button>
      </div>

      <CategoryFilter 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
      />

      <AddCategoryDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        formData={formData}
        isLoading={isLoading}
        handleChange={handleChange}
        handleTypeChange={handleTypeChange}
        handleCreateCategory={handleCreateCategory}
      />

      <EditCategoryDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        formData={formData}
        isLoading={isLoading}
        handleChange={handleChange}
        handleTypeChange={handleTypeChange}
        handleUpdateCategory={handleUpdateCategory}
      />

      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        onEdit={handleEditCategory}
        onDelete={handleDeleteSetup}
        categoryToDelete={categoryToDelete}
        handleDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};

export default CategoryManagement;
