
import { motion } from "framer-motion";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectFilters from "@/components/projects/ProjectFilters";
import ProjectSearch from "@/components/projects/ProjectSearch";
import ProjectSorting from "@/components/projects/ProjectSorting";
import ProjectList from "@/components/projects/ProjectList";
import { useProjectsFilter } from "@/hooks/useProjectsFilter";

const ProjectsCustom = () => {
  const {
    searchQuery,
    sortOption,
    sortedProjects,
    isLoading,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
  } = useProjectsFilter();

  // Фильтруем только индивидуальные проекты
  const customProjects = sortedProjects.filter(project => project.type === "custom");

  // Логирование для отладки
  useEffect(() => {
    customProjects.forEach(project => {
    });
  }, [customProjects, sortedProjects]);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Индивидуальные проекты домов</h1>
          <div className="max-w-3xl">
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Создаем уникальные проекты домов по вашим требованиям и пожеланиям. Наши архитекторы разработают для вас 
              эксклюзивный проект с учетом всех ваших предпочтений и особенностей участка.
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
              totalCount={customProjects.length}
            />
          </motion.div>
          
          <div className="lg:w-3/4 xl:w-4/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
            >
              <ProjectSearch 
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                resultsCount={customProjects.length}
              />
              
              <ProjectSorting 
                sortOption={sortOption}
                onSortChange={handleSortChange}
              />
            </motion.div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ProjectList projects={customProjects} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ProjectsCustom;
