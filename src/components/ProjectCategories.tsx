
import { Button } from "@/components/ui/button";
import { ChevronRight, FolderCheck, Home, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const houseCategories = [
  {
    title: "СЕРИЙНЫЕ ПРОЕКТЫ",
    image: "https://i.pinimg.com/1200x/db/e1/ab/dbe1ab1308ac0991f17d04e2320b80c7.jpg",
    icon: <FolderCheck className="h-4 w-4" />,
    url: "/projects/standard",
    description: "Готовые архитектурные решения различных стилей для быстрого старта строительства"
  },
  {
    title: "ИНДИВИДУАЛЬНЫЕ ПРОЕКТЫ",
    image: "/1.png.jpg",
    icon: <Home className="h-4 w-4" />,
    url: "/projects/custom",
    description: "Уникальные проекты, созданные специально для вас и вашей семьи"
  },
  {
    title: "КОММЕРЧЕСКИЕ ПРОЕКТЫ",
    image: "https://i.pinimg.com/1200x/d5/81/0d/d5810de6f9760c14174c58ac48ed5fa1.jpg",
    icon: <Building2 className="h-4 w-4" />,
    url: "/projects/commercial",
    description: "Проектирование и строительство офисов, магазинов и других коммерческих объектов"
  }
];

const ProjectCategories = () => {
  return (
    <div className="relative w-full">
      {/* Градиент теперь растягивается на всю ширину экрана */}
      <div className="absolute -top-8 inset-x-0 h-24 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="container mx-auto mt-4 md:mt-8 px-4">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 md:mb-12"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 text-center">
          Дома по каркасной технологии термопанелей
        </h2>
        <div className="w-16 md:w-24 h-1 bg-primary/20 mx-auto mb-4 md:mb-6"></div>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto text-center px-4">
          Выберите готовый проект или создайте индивидуальный дом мечты вместе с нами
        </p>
      </motion.div>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-6xl mx-auto flex-wrap">
        {houseCategories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="group w-full md:w-[450px] lg:w-[350px] overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 bg-white mb-6 md:mb-0"
          >
            <div className="relative h-[200px] sm:h-[250px] md:h-[300px] w-full overflow-hidden">
              <img 
                src={category.image} 
                alt={category.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-70" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white">
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 tracking-wider">{category.title}</h3>
                <p className="text-white/90 text-xs sm:text-sm mb-4 md:mb-6 max-w-[90%] md:max-w-[80%]">
                  {category.description}
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-white">
              <Link to={category.url}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full text-primary hover:text-white hover:bg-primary/90 justify-between text-xs sm:text-sm py-3 md:py-4 h-12 md:h-14"
                >
                  <span className="flex items-center gap-2">
                    {category.icon}
                    <span className="font-medium">Смотреть проекты</span>
                  </span>
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default ProjectCategories;
