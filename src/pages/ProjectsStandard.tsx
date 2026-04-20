
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectFilters from "@/components/projects/ProjectFilters";
import ProjectSearch from "@/components/projects/ProjectSearch";
import ProjectSorting from "@/components/projects/ProjectSorting";
import ProjectList from "@/components/projects/ProjectList";
import ProjectListView from "@/components/projects/ProjectListView";
import ViewToggle, { ViewMode } from "@/components/projects/ViewToggle";
import { useProjectsFilter } from "@/hooks/useProjectsFilter";
import { toast } from "sonner";
import { Project } from "@/services/project/types";

const ProjectsStandard = () => {
  // Состояние для хранения режима отображения
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  const {
    searchQuery,
    sortOption,
    sortedProjects,
    isLoading,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
  } = useProjectsFilter();

  // Фильтруем только типовые (standard) проекты
  const standardProjects = sortedProjects.filter(project => project.type === "standard") as Project[];

  // Логирование для отладки
  useEffect(() => {
    // Список всех типов проектов для отладки
    const projectTypes = new Set(sortedProjects.map(p => p.type));
    // Проверяем, есть ли у проектов изображения
    const projectsWithImages = standardProjects.filter(p => !!p.cover_image);
    // Показываем предупреждение, если есть проекты без изображений
    if (projectsWithImages.length < standardProjects.length && standardProjects.length > 0) {
      toast.warning(`${standardProjects.length - projectsWithImages.length} проектов не имеют изображений`);
    }
    
    // Подробная информация о проектах
    standardProjects.forEach(project => {
    });
  }, [standardProjects, sortedProjects]);

  // Обработчик изменения режима отображения
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Серийные проекты домов</h1>
          <div className="max-w-3xl">
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Выберите проект дома из нашего каталога готовых решений. Все проекты можно адаптировать под ваши потребности, 
              изменяя планировку, материалы отделки и комплектацию.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/4 xl:w-1/5"
          >
            <ProjectFilters 
              onFilterChange={handleFilterChange}
              totalCount={standardProjects.length}
            />
          </motion.div>
          
          <div className="lg:w-3/4 xl:w-4/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <ProjectSearch 
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  resultsCount={standardProjects.length}
                />
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <ViewToggle 
                  viewMode={viewMode} 
                  onViewModeChange={handleViewModeChange} 
                />
                
                <ProjectSorting 
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />
              </div>
            </motion.div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <ProjectList projects={standardProjects} />
                ) : (
                  <ProjectListView projects={standardProjects} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ProjectsStandard;
