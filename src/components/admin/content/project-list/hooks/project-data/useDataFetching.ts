
import { useCallback } from 'react';
import { db } from "@/integrations/db/client";
import { Project } from "@/services/project/types";
import projectService from "@/services/projectService";
import categoryService from "@/services/categoryService";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Хук для работы с загрузкой данных проектов
 */
export function useDataFetching(
  getCachedProjects: () => Project[] | null,
  cacheProjects: (projects: Project[]) => void,
  simulateLoadingProgress: () => () => void,
  setIsOfflineMode: (isOffline: boolean) => void,
  setProjects: (projects: Project[]) => void,
  setOfflineProjects: (projects: Project[]) => void,
  setCategories: (categories: any[]) => void,
  setError: (error: string | null) => void,
  setIsInitialLoad: (isInitial: boolean) => void,
  setLoadingProgress: (progress: number) => void,
  setIsLoading: (isLoading: boolean) => void,
  lastFetchTimeRef: React.MutableRefObject<number>
) {
  /**
   * Загружает проекты из базы данных
   */
  const fetchProjects = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 5000) {
      return;
    }
    
    try {
      const { data, error } = await db
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      lastFetchTimeRef.current = now;
        
      if (error) {
        console.error("Ошибка при запросе проектов:", error);
        
        const cachedProjects = getCachedProjects();
        if (cachedProjects && cachedProjects.length > 0) {
          setIsOfflineMode(true);
          setOfflineProjects(cachedProjects);
          return;
        }
        
        throw error;
      }
      
      if (data && data.length > 0) {
        cacheProjects(data);
        setIsOfflineMode(false);
        
        if (JSON.stringify(data) !== JSON.stringify(await getCachedProjects())) {
          setProjects(data);
        }
      }
    } catch (err) {
      console.error("Ошибка в fetchProjects:", err);
      setIsOfflineMode(true);
      
      const cachedProjects = getCachedProjects();
      if (cachedProjects && cachedProjects.length > 0) {
        setOfflineProjects(cachedProjects);
      }
    }
  }, [getCachedProjects, cacheProjects, setIsOfflineMode, setProjects, setOfflineProjects, lastFetchTimeRef]);

  /**
   * Загружает все необходимые данные при инициализации
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const stopProgressSimulation = simulateLoadingProgress();
    
    try {
      const { data: sessionData } = await db.auth.getSession();
      const token = sessionData?.session?.access_token;

      let projectsData: Project[] = [];
      let categoriesData: any[] = [];

      try {
        const response = await fetch(`${API_BASE}/api/admin/projects/overview?limit=500`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const body = await response.json();
        if (!response.ok || !body?.success) {
          throw new Error(body?.error || "Не удалось загрузить данные проектов");
        }

        projectsData = (body.data?.projects || []).map((project: any) => {
          const numericAreaValue = typeof project.areavalue === 'number'
            ? project.areavalue
            : project.areavalue !== null && project.areavalue !== undefined
              ? Number(project.areavalue)
              : 0;

          const numericPriceValue = typeof project.pricevalue === 'number'
            ? project.pricevalue
            : project.pricevalue !== null && project.pricevalue !== undefined
              ? Number(project.pricevalue)
              : 0;

          return {
            ...project,
            areavalue: numericAreaValue,
            pricevalue: numericPriceValue,
            areaValue: numericAreaValue,
            priceValue: numericPriceValue,
            hasGarage: project.hasgarage || false,
            hasTerrace: project.hasterrace || false,
            is_published: Boolean(project.is_published),
            status: project.status || (project.is_published ? 'published' : 'draft'),
          };
        });
        categoriesData = body.data?.categories || [];

        setProjects(projectsData);
        cacheProjects(projectsData);
        setCategories(categoriesData);
        setIsOfflineMode(false);
      } catch (projectError: any) {
        console.error("Ошибка загрузки проектов:", projectError);

        const cachedProjects = getCachedProjects();
        if (cachedProjects && cachedProjects.length > 0) {
          projectsData = cachedProjects;
          setProjects(cachedProjects);
          setIsOfflineMode(true);

          try {
            const fallbackCategories = await categoryService.getCategories('project');
            setCategories(fallbackCategories);
          } catch (_) {
            // Ignore categories fallback errors in offline mode
          }
        } else {
          projectsData = await projectService.getProjects(false);
          setProjects(projectsData);
          cacheProjects(projectsData);

          const fallbackCategories = await categoryService.getCategories('project');
          setCategories(fallbackCategories);
        }
      }
       
      setIsInitialLoad(false);
    } catch (error: any) {
      console.error("Ошибка загрузки данных проектов:", error);
      setError(error.message || "Не удалось загрузить проекты. Проверьте подключение.");
      toast.error("Ошибка загрузки проектов", {
        description: error.message || "Не удалось загрузить проекты. Проверьте подключение."
      });
    } finally {
      stopProgressSimulation();
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  }, [
    getCachedProjects, 
    cacheProjects, 
    simulateLoadingProgress, 
    setIsLoading, 
    setError, 
    setProjects, 
    setOfflineProjects, 
    setCategories, 
    setIsInitialLoad, 
    setIsOfflineMode,
    setLoadingProgress
  ]);

  return {
    fetchProjects,
    loadData
  };
}
