
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Clock, Users, Shield } from "lucide-react";

const advantages = [
  {
    icon: <Award className="w-8 h-8 text-primary" />,
    title: "Высокий стандарт качества",
    description: "Используем только сертифицированные материалы с гарантией производителя"
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Короткие сроки строительства",
    description: "Благодаря современной технологии значительно сокращаем время строительства"
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Опытная команда",
    description: "Наши специалисты имеют многолетний опыт в строительстве"
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Гарантия качества",
    description: "Предоставляем письменную гарантию на все виды работ"
  }
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/50 to-transparent">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
            Почему выбирают нас
          </h2>
          <div className="w-20 h-1 bg-primary/20 mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-center">
            Мы создаем надежные и энергоэффективные дома, используя инновационные технологии
            и проверенные временем решения
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="mb-4 p-3 rounded-full bg-primary/10">
                    {advantage.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-center">{advantage.title}</h3>
                  <p className="text-muted-foreground text-sm text-center">{advantage.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
