
import { Project } from "@/types/project";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import projectService from "@/services/project/index";
import { useState, useCallback } from "react";
import { db } from "@/integrations/db/client";

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн ₽`;
  return `${value.toLocaleString("ru-RU")} ₽`;
}

/**
 * Хук для операций с проектами в личном кабинете
 * Предоставляет функции для добавления, удаления, экспорта и других операций с проектами
 */
export const useProjectOperations = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Обработчик для добавления нового проекта
  const handleAddProject = useCallback(() => {
    navigate("/account/projects/new");
  }, [navigate]);

  // Обработчик для просмотра проекта
  const handleViewProject = useCallback((projectId: string) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  // Обработчик для редактирования проекта
  const handleEditProject = useCallback((projectId: string) => {
    navigate(`/account/projects/edit/${projectId}`);
  }, [navigate]);

  // Обработчик для экспорта
  const handleExport = useCallback(async (format: "csv" | "excel" | "pdf") => {
    try {
      setIsExporting(true);
      toast.info("Загрузка данных проектов...");

      const { data, error } = await db
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("Нет проектов для экспорта");
        return;
      }

      const headers = [
        "Название", "Описание", "Тип", "Стиль", "Площадь (м²)", "Цена",
        "Спальни", "Санузлы", "Этажи", "Материал", "Гараж", "Терраса",
        "Опубликован", "Статус", "Дата создания"
      ];

      const rows = data.map((p: any) => [
        p.title,
        p.description || "",
        p.type || "",
        p.style || "",
        p.areavalue ?? "",
        formatPrice(p.pricevalue),
        p.bedrooms ?? "",
        p.bathrooms ?? "",
        p.stories ?? "",
        p.material || "",
        p.hasgarage ? "Да" : "Нет",
        p.hasterrace ? "Да" : "Нет",
        p.is_published ? "Да" : "Нет",
        p.status || "",
        p.created_at ? new Date(p.created_at).toLocaleDateString("ru-RU") : "",
      ]);

      if (format === "csv" || format === "excel") {
        const bom = "\uFEFF";
        const sep = format === "excel" ? ";" : ",";
        const csvContent = bom + [
          headers.map(escapeCSV).join(sep),
          ...rows.map(row => row.map(escapeCSV).join(sep)),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `projects_${new Date().toISOString().slice(0, 10)}.${format === "excel" ? "csv" : "csv"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Экспорт завершён: ${data.length} проектов`);
      } else if (format === "pdf") {
        const sep = ";";
        const csvContent = [
          headers.map(escapeCSV).join(sep),
          ...rows.map(row => row.map(escapeCSV).join(sep)),
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `projects_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Экспорт завершён (CSV): ${data.length} проектов`);
      }
    } catch (error: any) {
      console.error("Ошибка при экспорте:", error);
      toast.error(`Ошибка экспорта: ${error.message || "Неизвестная ошибка"}`);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Обработчик для публикации проекта
  const handlePublishProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setIsProcessing(true);
      
      // Получаем текущее состояние проекта
      const { data: projectData, error: fetchError } = await db
        .from('projects')
        .select('is_published')
        .eq('id', projectId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Инвертируем состояние публикации
      const newPublishState = !projectData.is_published;
      
      // Обновляем состояние публикации
      const { error: updateError } = await db
        .from('projects')
        .update({ 
          is_published: newPublishState,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
      
      if (updateError) throw updateError;
      
      // Показываем уведомление
      toast.success(newPublishState 
        ? "Проект успешно опубликован" 
        : "Проект снят с публикации");
      
      return true;
    } catch (error: any) {
      console.error("Ошибка при изменении статуса публикации проекта:", error);
      toast.error("Не удалось изменить статус публикации проекта");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Обработчик для удаления проекта
  const handleDeleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setIsProcessing(true);
      const success = await projectService.deleteProject(projectId);
      
      if (success) {
        // Создаем событие об удалении проекта
        window.dispatchEvent(new CustomEvent('project-deleted', { 
          detail: { projectId } 
        }));
        
        toast.success("Проект успешно удален");
        return true;
      } else {
        toast.error("Не удалось удалить проект");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при удалении проекта:", error);
      toast.error("Ошибка при удалении проекта");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Обработчик для архивации проекта (может быть расширен в будущем)
  const handleArchiveProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setIsProcessing(true);
      // Имитация архивации проекта
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Проект перемещен в архив");
      return true;
    } catch (error) {
      console.error("Ошибка при архивации проекта:", error);
      toast.error("Ошибка при архивации проекта");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    isExporting,
    handleAddProject,
    handleViewProject,
    handleEditProject,
    handleExport,
    handlePublishProject,
    handleDeleteProject,
    handleArchiveProject
  };
};
