
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Link не нужен для раскрытия внутри карточки
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, User } from 'lucide-react';
import { Review } from '@/services/review/types';
import reviewService from '@/services/review';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const allReviews = await reviewService.getReviews();
        const publishedReviews = allReviews.filter(
          review => review.status === 'published' || review.is_published
        );
        setReviews(publishedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Функция для отображения звездного рейтинга
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-center">Отзывы клиентов</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-center">
            Мнения и впечатления наших клиентов о сотрудничестве с нами
          </p>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {review.image_url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
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
                        <User className="h-10 w-10 text-gray-400 bg-gray-100 p-2 rounded-full" />
                      )}
                      <span className="font-medium">{review.author_name}</span>
                    </div>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold line-clamp-2">{review.title}</h2>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-gray-600 line-clamp-3">{review.content}</p>
                  
                  {review.projects && (
                    <div className="mt-4">
                      <span className="text-sm text-gray-500">Проект: </span>
                      <span className="text-sm font-medium">{review.projects.title}</span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Link
                    to={`/reviews/${review.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                      Читать полностью
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Отзывов пока нет</h2>
            <p className="text-gray-600 mb-4">Скоро здесь появятся отзывы наших клиентов</p>
          </div>
        )}

        {!isLoading && (
          <div className="mt-10 flex justify-center">
            <Button className="px-6 py-3 text-sm sm:text-base" asChild>
              <Link to="/reviews/write">Написать отзыв</Link>
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Reviews;
