// Сервис для создания новых проектов
import { db } from "@/integrations/db/client";
import { Project } from "./types";
import { toast } from "sonner";
import { HOUSE_STYLES } from "@/components/admin/content/project-form/constants";
import { withRetry } from "@/utils/retry";

// Переменная для отслеживания активных запросов на создание
const pendingCreations = new Map<string, boolean>();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Создает новый проект
 * @param project Данные проекта
 * @returns Созданный проект или null
 */
export const createProject = async (project: Project): Promise<Project | null> => {
  return withRetry(async () => {
    try {
      // Создаем уникальный ключ для текущего запроса на основе заголовка и времени
      const requestKey = `${project.title}_${Date.now()}`;
      
      // Проверяем, не выполняется ли уже создание проекта с таким же ключом
      if (pendingCreations.get(requestKey)) {
        console.warn("Предотвращено дублирование создания проекта:", project.title);
        return null;
      }
      
      // Помечаем, что начато создание проекта
      pendingCreations.set(requestKey, true);
      // Проверяем текущую сессию пользователя
      const { data } = await db.auth.getSession();
      const session = data?.session;
      
      // Проверяем наличие сессии и пользователя с более подробным логированием
      if (!session) {
        console.error("Ошибка создания проекта: сессия не найдена");
        return null;
      }
      
      if (!session.user) {
        console.error("Ошибка создания проекта: пользователь не найден в сессии");
        return null;
      }
      
      const userId = session.user.id;
      if (!userId) {
        console.error("Ошибка создания проекта: ID пользователя не определен");
        return null;
      }
      
      // Проверяем наличие и валидность поля style
      if (!project.style || !HOUSE_STYLES.some(s => s.value === project.style)) {
        project.style = "classic";
      }
      
      // Проверяем наличие массива тегов
      if (project.tags === undefined) {
        project.tags = [];
      }
      
      // Устанавливаем ID пользователя как создателя проекта
      project.created_by = userId;
      
      // Явно устанавливаем и логируем статус публикации
      project.is_published = Boolean(project.is_published);
      // Логгирование информации о проектировщике
      // Создаем копию проекта без полей, которых нет в таблице
      const cleanProject: any = { ...project };
      
      // Удаляем UI-специфичные поля, которых нет в базе данных
      delete cleanProject.areaValue;
      delete cleanProject.priceValue;
      delete cleanProject.hasGarage;
      delete cleanProject.hasTerrace;
      delete cleanProject.categories;
      delete cleanProject.status;
      delete cleanProject.creator_id;
      delete cleanProject.currentStage;
      delete cleanProject.startDate;
      delete cleanProject.endDate;
      delete cleanProject.progress;
      // Явно указываем поле created_by и is_published для соответствия RLS политике
      const { data: createdProjectData, error } = await db
        .from('projects')
        .insert([{
          ...cleanProject,
          created_by: userId,
          is_published: Boolean(cleanProject.is_published)
        }])
        .select('*');  // Выбираем все поля

      if (error) {
        console.error("Ошибка создания проекта:", error);
        return null;
      }

      // Проверяем, получены ли данные созданного проекта
      if (!createdProjectData || createdProjectData.length === 0) {
        console.error("Ошибка: проект создан, но данные не возвращены");
        
        // Добавляем задержку для уверенности, что проект успел сохраниться в БД
        await new Promise(resolve => setTimeout(resolve, 1500)); // Увеличиваем время ожидания до 1.5 секунды
        
        // Пробуем получить созданный проект по его заголовку и ID создателя
        const { data: retrievedProject, error: retrieveError } = await db
          .from('projects')
          .select('*')
          .eq('title', project.title)
          .eq('created_by', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        pendingCreations.delete(requestKey);
        
        if (retrieveError || !retrievedProject) {
          console.error("Не удалось получить данные созданного проекта:", retrieveError);
          return null;
        }
        toast.success("Проект успешно создан");
        
        // Преобразуем snake_case поля в camelCase для UI
        const enhancedProject = {
          ...retrievedProject,
          areaValue: retrievedProject.areavalue,
          priceValue: retrievedProject.pricevalue,
          hasGarage: retrievedProject.hasgarage,
          hasTerrace: retrievedProject.hasterrace
        };
        
        return enhancedProject as Project;
      }

      const createdProject = createdProjectData[0];
      pendingCreations.delete(requestKey);
      toast.success("Проект успешно создан");
      
      // Преобразуем snake_case поля в camelCase для UI
      const enhancedProject = {
        ...createdProject,
        areaValue: createdProject.areavalue,
        priceValue: createdProject.pricevalue,
        hasGarage: createdProject.hasgarage,
        hasTerrace: createdProject.hasterrace
      };
      
      return enhancedProject as Project;
    } catch (error: any) {
      console.error("Не удалось создать проект:", error);
      return null;
    }
  }, {
    onError: (error) => {
      toast.error(`Не удалось создать проект: ${error?.message || "Неизвестная ошибка"}`);
    }
  });
};

// Экспортируем объект по умолчанию для совместимости
const projectCreateService = {
  createProject
};

export default projectCreateService;
