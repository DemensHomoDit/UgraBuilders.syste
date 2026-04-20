import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, User } from 'lucide-react';
import { Review } from '@/services/review/types';
import reviewService from '@/services/review';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ReviewsFull: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const all = await reviewService.getReviews();
        const published = all.filter(r => r.is_published);
        setReviews(published);
      } catch (e) {
        console.error('Error load reviews', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const renderStars = (rating:number)=>Array.from({length:5}).map((_,i)=>(
    <Star key={i} className={`h-4 w-4 ${i<rating?'text-yellow-500 fill-yellow-500':'text-gray-300'}`} />
  ));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">Все отзывы</h1>
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : (
          <div className="space-y-10">
            {reviews.map(r=>(
              <Card key={r.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.author_name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <User className="h-14 w-14 text-gray-400 bg-gray-100 p-3 rounded-full" />
                    )}
                    <div>
                      <h2 className="text-xl font-medium">{r.author_name}</h2>
                      <div className="flex mt-1">{renderStars(r.rating)}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">{r.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{r.content}</p>
                  {r.projects && (
                    <p className="mt-4 text-sm text-gray-500">Проект: <span className="font-medium">{r.projects.title}</span></p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ReviewsFull; 