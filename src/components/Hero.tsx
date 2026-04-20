
import { motion } from "framer-motion";
import HeroCarousel from "./HeroCarousel";
import { db } from "@/integrations/db/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Hero = () => {
  const [heroData, setHeroData] = useState<{
    title?: string;
    description?: string;
    link_url?: string;
  }>({});
  
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        const { data: heroData, error: heroError } = await db
          .from("hero_carousel")
          .select("*")
          .order("display_order", { ascending: true })
          .limit(1)
          .single();
          
        if (heroError) throw heroError;
        if (heroData) {
          setHeroData({
            title: heroData.title,
            description: heroData.description,
            link_url: heroData.link_url
          });
        }
        
      } catch (error: any) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };
    
    loadHeroData();
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0">
        <HeroCarousel />
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container relative z-20 px-4">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 max-w-xl text-white relative z-30 pl-4 md:pl-8"
          >
            {heroData.title && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                {heroData.title}
              </h1>
            )}
            
            {heroData.description && (
              <p className="text-base md:text-lg opacity-90">
                {heroData.description}
              </p>
            )}
            
            <div className="flex flex-col space-y-4">
              {heroData.link_url && (
                <Button 
                  size="lg"
                  asChild
                  className="w-full sm:w-auto rounded-full px-8 py-4 text-base"
                >
                  <Link to={heroData.link_url}>Узнать больше</Link>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto rounded-full px-8 py-4 text-base bg-white/10 hover:bg-white/20 border-white/50"
              >
                Получить консультацию
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
