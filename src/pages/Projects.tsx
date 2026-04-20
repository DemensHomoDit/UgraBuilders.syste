
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const makeCategoryImage = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#0f172a'/><stop offset='100%' stop-color='#334155'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#e2e8f0' font-size='54' font-family='Arial'>${label}</text></svg>`,
  )}`;

const Projects = () => {
  const navigate = useNavigate();
  
  // Категории проектов с их описаниями
  const projectCategories = [
    {
      title: "Серийные проекты",
      description: "Готовые проекты домов различных стилей и размеров",
      path: "/projects/standard",
      image: makeCategoryImage("Serial projects"),
    },
    {
      title: "Индивидуальные проекты",
      description: "Уникальные проекты, разработанные по индивидуальным требованиям",
      path: "/projects/custom",
      image: makeCategoryImage("Custom projects"),
    },
    {
      title: "Коммерческие проекты",
      description: "Проекты для бизнеса: офисы, магазины, рестораны и другие объекты",
      path: "/projects/commercial",
      image: makeCategoryImage("Commercial"),
    },
    {
      title: "Галерея объектов",
      description: "Фотогалерея реализованных проектов",
      path: "/projects/gallery",
      image: makeCategoryImage("Gallery"),
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Наши проекты</h1>
          <div className="max-w-3xl">
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Выберите категорию проектов, чтобы ознакомиться с нашими предложениями. 
              Мы предлагаем как типовые, так и индивидуальные решения для любых потребностей.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {projectCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(category.path)}
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = makeCategoryImage("Image unavailable");
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-2">{category.title}</h3>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Projects;
