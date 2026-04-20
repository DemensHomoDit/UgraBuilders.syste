import { useState, useEffect } from "react";
import { db } from "@/integrations/db/client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { motion } from "framer-motion";

// Интерфейс для слайдов карусели
interface CarouselSlide {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
  display_order: number;
  show_consult_button?: boolean;
  main_button_text?: string;
  consult_button_text?: string;
}

const HeroCarousel = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка изображений для карусели из базы данных
  useEffect(() => {
    const loadCarouselImages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db
          .from("hero_carousel")
          .select("*")
          .order("display_order", { ascending: true });
        if (error) throw error;
        setSlides(data || []);
      } catch (error) {
        setSlides([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCarouselImages();
  }, []);

  if (isLoading) {
    return (
      <div className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden -mt-[20px] bg-secondary/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse w-16 h-16 rounded-full bg-primary/20"></div>
        </div>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden -mt-[20px] bg-secondary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-bold">Югра Билдерс</h1>
            <p className="text-muted-foreground">Добавьте слайды в разделе администрирования главной страницы</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }} 
      className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden -mt-[20px]"
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <img 
                src={slide.image_url} 
                alt={slide.title || "Современный дом"} 
                className="object-cover w-full h-full transition-transform duration-700 ease-in-out" 
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-xl text-white space-y-6">
                    {slide.title && (
                      <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        {slide.title}
                      </h1>
                    )}
                    {slide.description && (
                      <p className="text-lg md:text-xl opacity-90">
                        {slide.description}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {slide.link_url?.trim() && (
                        <a 
                          href={slide.link_url}
                          className="bg-primary text-white px-8 py-3 rounded-full text-base font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
                        >
                          {slide.main_button_text?.trim() || 'Узнать больше'}
                        </a>
                      )}
                      {slide.show_consult_button !== false && (
                        <button className="bg-white/10 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-white/20 transition-colors border border-white/50">
                          {slide.consult_button_text?.trim() || 'Получить консультацию'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default HeroCarousel;
