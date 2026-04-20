
import { Award, Clock, Users, Hammer, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const reasons = [
  {
    title: "КАЧЕСТВО",
    description: "Мы используем только проверенные материалы и передовые технологии строительства",
    icon: <Award className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    link: "/about"
  },
  {
    title: "ТОЧНЫЕ СРОКИ",
    description: "Ваш дом будет построен точно в срок благодаря отлаженным процессам",
    icon: <Clock className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    link: "/process"
  },
  {
    title: "ОПЫТНАЯ КОМАНДА",
    description: "Наши специалисты имеют более 15 лет опыта в строительстве",
    icon: <Users className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    link: "/about"
  },
  {
    title: "ИНДИВИДУАЛЬНЫЙ ПОДХОД",
    description: "Мы учитываем все пожелания и создаем дом вашей мечты",
    icon: <Hammer className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    link: "/services"
  },
  {
    title: "ГАРАНТИЯ",
    description: "Предоставляем гарантию на все виды работ и материалы",
    icon: <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    link: "/services"
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-12 md:py-16 lg:py-24 relative bg-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 text-center">
            Почему выбирают нас
          </h2>
          <div className="w-16 md:w-20 h-1 bg-primary/20 mx-auto mb-4 md:mb-6" />
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4 text-pretty text-center">
            Мы строим не просто дома, а создаем пространство для счастливой жизни. 
            Наша команда профессионалов поможет воплотить в жизнь ваши самые смелые идеи.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative"
            >
              <Link to={reason.link} className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 rounded-2xl transform transition-transform group-hover:scale-105 duration-300" />
                <div className="relative bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col items-center text-center">
                  <div className="mb-3 md:mb-4 p-3 md:p-4 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
                    {reason.icon}
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-primary mb-2 md:mb-3 text-center">{reason.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm text-center">{reason.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
