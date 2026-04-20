
import { useState, useMemo, useEffect } from "react";
import { Project } from "@/services/project/types";
import { FilterCriteria } from "@/components/projects/ProjectFilters";
import { db } from "@/integrations/db/client";
import { toast } from "sonner";
import { HOUSE_STYLES } from "@/components/admin/content/project-form/constants";

export function useProjectsFilter(initialProjects: Project[] = []) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("popularity");
  const [filters, setFilters] = useState<FilterCriteria>({
    styles: [],
    floors: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const { data } = await db.auth.getSession();
        const session = data?.session;
        
        let query = db
          .from("projects")
          .select("*")
          .eq("is_published", true);
        const { data: projectsData, error } = await query;

        if (error) {
          console.error("Error fetching projects in hook:", error);
          toast.error(`Ошибка загрузки проектов: ${error.message}`);
          setProjects([]);
          return;
        }

        if (!projectsData || projectsData.length === 0) {
          setProjects([]);
          return;
        }
        // Группируем проекты по типам для отладки
        const typeGroups: Record<string, number> = {};
        projectsData.forEach(p => {
          const type = p.type || 'standard';
          typeGroups[type] = (typeGroups[type] || 0) + 1;
        });
        const enhancedProjects = projectsData.map(project => ({
          ...project,
          is_published: Boolean(project.is_published),
          type: project.type || 'standard' // Задаем стандартный тип, если тип не указан
        }));
        
        setProjects(enhancedProjects);
      } catch (error: any) {
        console.error("Failed to fetch projects in hook:", error);
        toast.error(`Ошибка при загрузке проектов: ${error.message || "Неизвестная ошибка"}`);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (
          !project.title?.toLowerCase().includes(searchLower) &&
          !project.description?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (filters.styles.length > 0 && !filters.styles.includes(project.style || "")) {
        return false;
      }
      
      if (filters.floors.length > 0 && !filters.floors.includes(project.stories || 0)) {
        return false;
      }

      if (filters.minArea && (project.areavalue || 0) < filters.minArea) {
        return false;
      }
      if (filters.maxArea && (project.areavalue || 0) > filters.maxArea) {
        return false;
      }

      if (filters.minPrice && (project.pricevalue || 0) < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && (project.pricevalue || 0) > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, filters]);

  const availableStyles = useMemo(() => {
    return HOUSE_STYLES;
  }, []);

  const availableFloors = useMemo(() => {
    const floors = new Set<number>();
    projects.forEach(project => {
      if (project.stories) {
        floors.add(project.stories);
      }
    });
    return Array.from(floors);
  }, [projects]);

  const sortedProjects = useMemo(() => {
    let sorted = [...filteredProjects];
    sorted.sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return (a.pricevalue || 0) - (b.pricevalue || 0);
        case "price-desc":
          return (b.pricevalue || 0) - (a.pricevalue || 0);
        case "area-asc":
          return (a.areavalue || 0) - (b.areavalue || 0);
        case "area-desc":
          return (b.areavalue || 0) - (a.areavalue || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredProjects, sortOption]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleFilterChange = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  return {
    searchQuery,
    sortOption,
    filters,
    filteredProjects,
    sortedProjects,
    isLoading,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    availableStyles,
    availableFloors
  };
}
