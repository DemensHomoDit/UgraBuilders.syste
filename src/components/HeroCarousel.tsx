import { useState, useEffect } from "react";
import { db } from "@/integrations/db/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface Slide {
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

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.from("hero_carousel").select("*").order("display_order", { ascending: true })
      .then(({ data }) => { setSlides(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const scrollDown = () => window.scrollTo({ top: window.innerHeight, behavior: "smooth" });

  if (loading) return <div className="w-full h-[88vh] bg-gray-100 animate-pulse rounded-none" />;

  if (!slides.length) return (
    <div className="w-full h-[88vh] bg-gradient-to-br from-primary/8 to-primary/3 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 tracking-tight">Югра Билдерс</h1>
        <p className="text-gray-400 text-lg">Добавьте слайды в панели администратора</p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[88vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <img src={slide.image_url} alt={slide.title || ""} className="w-full h-full object-cover" />
              {/* Многослойный градиент */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

              {/* Контент */}
              <div className="absolute inset-0 flex flex-col justify-end pb-20 md:pb-24">
                <div className="max-w-[1320px] mx-auto px-5 md:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl"
                  >
                    {slide.title && (
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.08] tracking-tight">
                        {slide.title}
                      </h1>
                    )}
                    {slide.description && (
                      <p className="text-white/75 text-base md:text-lg mb-8 max-w-xl font-normal leading-relaxed">
                        {slide.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {slide.link_url?.trim() && (
                        <Link to={slide.link_url}
                          className="inline-flex items-center gap-2.5 bg-white text-gray-900 text-sm font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/95 active:scale-[0.98] transition-all shadow-lg"
                        >
                          {slide.main_button_text?.trim() || "Смотреть проекты"}
                          <ArrowRight size={16} />
                        </Link>
                      )}
                      {slide.show_consult_button !== false && (
                        <Link to="/contacts"
                          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-6 py-3.5 rounded-2xl border border-white/25 hover:bg-white/25 transition-all"
                        >
                          {slide.consult_button_text?.trim() || "Получить консультацию"}
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Скролл вниз */}
      <button onClick={scrollDown}
        className="absolute bottom-8 right-8 z-10 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all animate-bounce"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
}
