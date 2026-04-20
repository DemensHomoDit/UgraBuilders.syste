import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, User, Home, Phone } from 'lucide-react';
import { Review, ReviewImage } from '@/services/review/types';
import reviewService from '@/services/review';
import projectService from "@/services/project";
import ProjectCard from "@/components/projects/ProjectCard";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageViewer from '@/components/shared/ImageViewer';
import { Project } from '@/services/project/types';

const ReviewDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<Review | null>(null);
  const [reviewImages, setReviewImages] = useState<ReviewImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const reviewData = await reviewService.getReview(id);
        if (reviewData) {
          setReview(reviewData);
          if (reviewData.project_id) {
            const proj = await projectService.getProjectById(reviewData.project_id);
            if (proj) setProject(proj);
          }
          
          const images = await reviewService.getReviewImages(id);
          setReviewImages(images);
        } else {
          toast({
            title: "Отзыв не найден",
            description: "Запрашиваемый отзыв не существует или был удален",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching review:", error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить отзыв",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev < reviewImages.length - 1 ? prev + 1 : prev
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : prev
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Отзыв не найден</h1>
            <p className="mb-6">Запрашиваемый отзыв не существует или был удален.</p>
            <Button asChild>
              <Link to="/reviews">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к отзывам
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/reviews">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к отзывам
          </Link>
        </Button>
        
        <article className="bg-white rounded-lg p-6 shadow-sm">
          <header className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                {review.image_url ? (
                  <div className="rounded-full overflow-hidden w-16 h-16 border border-gray-200 flex-shrink-0">
                    <img 
                      src={review.image_url} 
                      alt={review.author_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <User className="h-16 w-16 text-gray-400 bg-gray-100 p-3 rounded-full" />
                )}
                <div>
                  <h2 className="text-xl font-medium">{review.author_name}</h2>
                  <div className="flex mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{review.title}</h1>
          </header>
          
          {review.projects && (
            <div className="bg-gray-50 px-4 py-3 rounded-md mb-6">
              <span className="font-medium">Проект: </span>
              <Link to={`/projects/${review.project_id}`} className="text-primary hover:underline">
                {review.projects.title}
              </Link>
            </div>
          )}
          {project && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Проект из отзыва</h2>
              <ProjectCard project={project} />
            </div>
          )}
          
          <div className="prose max-w-none mb-8">
            {review.content && (
              <div dangerouslySetInnerHTML={{ __html: review.content.replace(/\n/g, '<br />') }} />
            )}
          </div>
          
          {reviewImages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Фотографии проекта:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {reviewImages.map((image, index) => (
                  <div 
                    key={image.id} 
                    className="overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => openImageViewer(index)}
                  >
                    <div className="aspect-video relative">
                      <img 
                        src={image.image_url} 
                        alt={image.description || 'Фото проекта'} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="bg-primary/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <Home className="mr-2 h-5 w-5 text-primary" />
                {review.project_id ? "Понравился этот проект? Мы построим такой же для вас!" : "Хотите такой же дом? Мы можем построить его для вас!"}
              </h3>
              <p className="mb-4">Мы можем построить для вас такой же дом или адаптировать проект под ваши требования.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="flex-1">
                  <Link to={review.project_id ? `/projects/${review.project_id}` : "/contacts"}>
                    {review.project_id ? "Посмотреть подробности проекта" : "Заказать подобный проект"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link to="/contacts">
                    <Phone className="mr-2 h-4 w-4" />
                    Связаться с нами
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>
      
      {reviewImages.length > 0 && (
        <ImageViewer 
          images={reviewImages}
          currentIndex={currentImageIndex}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ReviewDetails;
