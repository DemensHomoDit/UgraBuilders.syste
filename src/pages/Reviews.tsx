import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, User } from 'lucide-react';
import { Review } from '@/services/review/types';
import reviewService from '@/services/review';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const all = await reviewService.getReviews();
        setReviews(all.filter(r => r.status === 'published' || r.is_published));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, []);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
    ));

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="label-tag mb-5">Отзывы</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-xl leading-[1.08]">
                Что говорят наши клиенты
              </h1>
              <Link to="/reviews/write"
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Написать отзыв <ArrowUpRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Отзывы */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl h-56 animate-pulse" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review, i) => (
                <motion.div key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link to={`/reviews/${review.id}`}
                    className="group flex flex-col bg-white border border-gray-100/80 rounded-3xl p-7 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 h-full"
                  >
                    {/* Шапка */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {review.image_url ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <img src={review.image_url} alt={review.author_name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                            <User size={16} className="text-primary/60" />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-800">{review.author_name}</span>
                      </div>
                      <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                    </div>

                    {/* Заголовок */}
                    <h2 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">{review.title}</h2>

                    {/* Текст */}
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed flex-grow">{review.content}</p>

                    {review.projects && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Проект: </span>
                        <span className="text-xs font-medium text-gray-600">{review.projects.title}</span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      Читать полностью <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Отзывов пока нет</h2>
              <p className="text-gray-500 mb-6">Скоро здесь появятся отзывы наших клиентов</p>
              <Link to="/reviews/write" className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
                Оставить первый отзыв
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Reviews;
