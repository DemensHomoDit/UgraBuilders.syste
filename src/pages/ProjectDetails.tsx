
import { useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { ProjectDetailView } from "./project/ProjectDetailView";
import ProjectLoadingState from "./project/ProjectLoadingState";
import ProjectErrorState from "./project/ProjectErrorState";

const ProjectDetails = () => {
  const { id } = useParams();
  // Получаем информацию о текущем URL для анализа параметров запроса
  const location = useLocation();
  const { 
    project, 
    isLoading, 
    error, 
    images, 
    mainImages,
    generalImages,
    floorPlanImages,
    projectPrice, 
    projectType,
    designerName
  } = useProjectDetails(id);

  // Логирование для отладки
  if (isLoading) {
    return <ProjectLoadingState />;
  }

  if (!project) {
    return <ProjectErrorState />;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <ProjectDetailView
          project={project}
          images={images}
          mainImages={mainImages}
          generalImages={generalImages}
          floorPlanImages={floorPlanImages}
          projectPrice={projectPrice}
          projectType={projectType}
          designerName={designerName}
        />
      </div>
      <Footer />
    </main>
  );
};

export default ProjectDetails;
