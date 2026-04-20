import React, { useState } from "react";
import { Project, ProjectImage } from "@/services/project/types";
import { Button } from "@/components/ui/button";
import { 
  BedDouble, 
  Bath, 
  PhoneCall, 
  Layers,
  Home,
  Ruler,
  ArrowLeft,
  Heart,
  HelpCircle,
  DollarSign,
  Hammer,
} from "lucide-react";
import ImageDisplay from "@/components/shared/ImageDisplay";
import ProjectContactForm from "./ProjectContactForm";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import ImageViewer from "@/components/shared/ImageViewer";
import ProjectFeatures from "./components/ProjectFeatures";
import ProjectPriceCard from "./components/ProjectPriceCard";
import ProjectBreadcrumbs from "./components/ProjectBreadcrumbs";
import ProjectDescription from "./components/ProjectDescription";
import ProjectGallery from "./components/ProjectGallery";
import { HOUSE_STYLES } from "@/components/admin/content/project-form/constants";
import { FORM_TOPICS } from "@/services/integration/types/formTypes";

// Основное представление деталей проекта
interface ProjectDetailViewProps {
  project: Project;
  images: ProjectImage[];
  mainImages: ProjectImage[];
  generalImages: ProjectImage[];
  floorPlanImages: ProjectImage[];
  projectPrice: string;
  projectType: string;
  designerName: string;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  images,
  mainImages,
  generalImages,
  floorPlanImages,
  projectPrice,
  projectType,
  designerName
}) => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(FORM_TOPICS.CUSTOM_PROJECT);
  const navigate = useNavigate();
  
  // Определяем основное изображение
  const mainImageUrl = mainImages.length > 0 
    ? mainImages[0].image_url 
    : (generalImages.length > 0 
      ? generalImages[0].image_url 
      : (project.cover_image || ''));

  // Формируем параграфы описания
  const contentParagraphs = project.content?.split('\n').filter(p => p.trim()) || [];

  // Callbacks для просмотра изображений
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  const handleBackToProjects = () => {
    let targetUrl = '/projects';
    
    if (project.type) {
      switch (project.type) {
        case 'standard':
          targetUrl = '/projects/standard';
          break;
        case 'custom':
          targetUrl = '/projects/custom';
          break;
        case 'commercial':
          targetUrl = '/projects/commercial';
          break;
        default:
          targetUrl = '/projects';
      }
    }
    navigate(targetUrl);
  };

  // Обработчик клика на кнопки темы обращения
  const handleTopicButtonClick = (topic: string) => {
    setSelectedTopic(topic);
    setIsContactFormOpen(true);
    
    // Прокрутка к форме на мобильных устройствах
    const contactFormElement = document.getElementById('contact-form-mobile');
    if (contactFormElement) {
      setTimeout(() => {
        contactFormElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Признаки наличия характеристик проекта
  const hasArea = project.areavalue && project.areavalue > 0;
  const hasDimensions = project.dimensions && project.dimensions.trim() !== '';
  const hasBedrooms = project.bedrooms && project.bedrooms > 0;
  const hasStories = project.stories && project.stories > 0;
  const hasBathrooms = project.bathrooms && project.bathrooms > 0;
  
  // Данные для карточек параметров
  const projectFeatures = [
    hasArea && {
      icon: <Home className="h-8 w-8 text-primary mb-2" />,
      value: `${project.areavalue} м²`,
      label: "Общая площадь"
    },
    hasDimensions && {
      icon: <Ruler className="h-8 w-8 text-primary mb-2" />,
      value: project.dimensions,
      label: "Размеры"
    },
    hasBedrooms && {
      icon: <BedDouble className="h-8 w-8 text-primary mb-2" />,
      value: project.bedrooms,
      label: "Спален"
    },
    hasStories && {
      icon: <Layers className="h-8 w-8 text-primary mb-2" />,
      value: project.stories,
      label: "Этажей"
    },
    hasBathrooms && {
      icon: <Bath className="h-8 w-8 text-primary mb-2" />,
      value: project.bathrooms,
      label: "Санузлов"
    }
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Хлебные крошки */}
      <ProjectBreadcrumbs projectTitle={project.title} />

      {/* Картинка и общее описание, кнопка возврата */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white/90"
          onClick={handleBackToProjects}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          К проектам
        </Button>
        
        <div className="w-full h-[70vh] flex items-center justify-center">
          <ImageDisplay 
            imageUrl={mainImageUrl || ''} 
            alt={project.title} 
            className="w-full h-full object-contain"
            aspectRatio="16/9"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-6 md:p-8 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/90 hover:bg-primary">{projectType}</Badge>
              {project.style && (
                <Badge variant="outline" className="text-white border-white/40 bg-black/20">
                  {HOUSE_STYLES.find(s => s.value === project.style)?.label || project.style}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-white/90 max-w-3xl">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Мобильная форма заявки */}
      <div id="contact-form-mobile" className="lg:hidden">
        {isContactFormOpen && (
          <ProjectContactForm project={project} initialTopic={selectedTopic} />
        )}
      </div>

      {/* Характеристики, описание, галерея, форма заявки (только мобильная/планшет) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {projectFeatures.length > 0 && (
            <ProjectFeatures features={projectFeatures as any[]} />
          )}

          <ProjectDescription 
            title={project.title}
            description={project.description}
            contentParagraphs={contentParagraphs}
            designerName={designerName}
          />

          <ProjectGallery images={images} onImageClick={handleImageClick} />
        </div>

        {/* Карточка цены и форма заявки справа на десктопе */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <ProjectPriceCard
            projectPrice={projectPrice}
            areavalue={project.areavalue}
            projectType={projectType}
            style={project.style}
          />
          <div id="contact-form" className="hidden lg:block">
            <ProjectContactForm project={project} initialTopic={selectedTopic} />
          </div>
        </div>
      </div>

      {/* Модальное окно просмотра изображений */}
      {isImageViewerOpen && images.length > 0 && (
        <ImageViewer
          images={images}
          currentIndex={currentImageIndex}
          isOpen={isImageViewerOpen}
          onClose={handleCloseImageViewer}
          onNext={handleNextImage}
          onPrevious={handlePrevImage}
        />
      )}
    </div>
  );
};
