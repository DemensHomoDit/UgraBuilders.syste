
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import categoryService, { Category } from "@/services/categoryService";
import { CategoryFormData, CategoryType } from "./types";

export const useCategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryType | 'all'>('all');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    type: "project"
  });
  const { toast } = useToast();

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    const data = await categoryService.getCategories();
    setCategories(data);
    setIsLoading(false);
  };

  // Filter categories whenever the active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(categories.filter(category => category.type === activeFilter));
    }
  }, [categories, activeFilter]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      type: value as 'project' | 'blog' | 'news' 
    }));
  };

  // Handle filter change
  const handleFilterChange = (type: CategoryType | 'all') => {
    setActiveFilter(type);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "project"
    });
  };

  // Open edit dialog
  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      type: category.type
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete category setup
  const handleDeleteSetup = (category: Category | null) => {
    setCategoryToDelete(category);
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название категории не может быть пустым",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const result = await categoryService.createCategory(formData);
    setIsLoading(false);
    
    if (result) {
      setIsAddDialogOpen(false);
      resetForm();
      loadCategories();
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!categoryToEdit || !formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название категории не может быть пустым",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const result = await categoryService.updateCategory(categoryToEdit.id!, formData);
    setIsLoading(false);
    
    if (result) {
      setIsEditDialogOpen(false);
      setCategoryToEdit(null);
      resetForm();
      loadCategories();
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsLoading(true);
    const result = await categoryService.deleteCategory(categoryToDelete.id!);
    setIsLoading(false);
    
    if (result) {
      setCategoryToDelete(null);
      loadCategories();
    }
  };

  return {
    categories: filteredCategories,
    allCategories: categories,
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
  };
};
