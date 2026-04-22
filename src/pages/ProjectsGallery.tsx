
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, ImageIcon, MapPin, CalendarRange } from "lucide-react";
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  city?: string;
  description?: string;
  construction_year?: number;
  created_at: string;
}

const ProjectsGallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch gallery items
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db
          .from("gallery_items")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setGalleryItems(data || []);
      } catch (error: any) {
        console.error("Error fetching gallery items:", error);
        toast.error("Ошибка при загрузке галереи", {
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGalleryItems();
  }, []);
  
  // Filter gallery items based on search query
  const filteredItems = galleryItems.filter(item => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(search)) ||
      (item.city && item.city.toLowerCase().includes(search)) ||
      (item.description && item.description.toLowerCase().includes(search))
    );
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Галерея наших работ</h1>
          <div className="max-w-3xl">
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              В этом разделе представлены фотографии домов, построенных нашей компанией.
              Вы можете познакомиться с реальными проектами и оценить качество нашей работы.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="my-8"
        >
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Поиск по галерее..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {(item.city || item.construction_year) && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {item.city && (
                        <div className="flex items-center text-white/90 text-sm mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{item.city}</span>
                        </div>
                      )}
                      {item.construction_year && (
                        <div className="flex items-center text-white/90 text-sm">
                          <CalendarRange className="w-3 h-3 mr-1" />
                          <span>{item.construction_year} г.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-primary">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Нет фотографий</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? "По вашему запросу ничего не найдено" : "В галерее пока нет фотографий"}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default ProjectsGallery;
