import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/integrations/db/client";
import { OurObject } from "@/types/ourObjects";
import { filterPublished, sortObjects } from "@/utils/ourObjects";
import OurObjectCard from "@/components/objects/OurObjectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function OurObjectsPage() {
  const [objects, setObjects] = useState<OurObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchObjects = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await db
          .from("our_objects")
          .select("id, title, subtitle, excerpt, city, cover_image, display_order, is_published, created_at")
          .eq("is_published", true)
          .order("display_order", { ascending: true });

        if (error) throw error;

        // Apply client-side filtering and sorting
        const published = filterPublished(data || []);
        const sorted = sortObjects(published);
        setObjects(sorted);
      } catch (error) {
        console.error("Error loading objects:", error);
        toast.error("Не удалось загрузить объекты");
      } finally {
        setIsLoading(false);
      }
    };

    fetchObjects();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="label-tag mb-5">Портфолио</p>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-2xl leading-[1.08] mb-5">
              Наши объекты
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Завершённые проекты домов и коммерческих объектов по каркасной технологии. 
              Каждый объект — это реализованная мечта наших клиентов.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Objects Grid */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          {isLoading ? (
            // Skeleton loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="bg-gray-100 rounded-3xl aspect-[4/3] animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded-lg w-5/6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : objects.length > 0 ? (
            // Objects grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {objects.map((object, index) => (
                <OurObjectCard key={object.id} object={object} index={index} />
              ))}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                Объекты скоро появятся
              </h2>
              <p className="text-gray-500">
                Мы работаем над наполнением этого раздела
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
