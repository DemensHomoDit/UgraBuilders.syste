import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, Building, Factory, Truck, Hammer, HomeIcon, DoorOpen, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CONSTRUCTION_STAGES, WORK_TASKS } from "@/services/constants/constructionData";

const Process = () => {
  const steps = [
    {
      number: "01",
      title: "Выбор проекта и проектирование",
      description: "Создаем индивидуальный проект дома с учетом всех технических требований и ваших предпочтений.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      image: "https://i.pinimg.com/736x/aa/80/54/aa80548306ad944da5c663821ea6179b.jpg", // updated image
      details: "Наши архитекторы разработают проект дома, учитывающий все технические требования, особенности участка и ваши пожелания по планировке и дизайну."
    },
    {
      number: "02",
      title: "Фундамент",
      description: "Закладываем прочное основание для вашего дома с использованием современных технологий и материалов.",
      icon: <Building className="h-8 w-8 text-primary" />,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop",
      details: "Используем качественные материалы и проверенные технологии для создания надежного и долговечного фундамента, который выдержит все нагрузки."
    },
    {
      number: "03",
      title: "Производство дома",
      description: "Изготавливаем все элементы дома на собственном производстве с контролем качества на всех этапах.",
      icon: <Factory className="h-8 w-8 text-primary" />,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop",
      details: "На нашем производстве мы создаем все необходимые элементы для строительства вашего дома с соблюдением строгих стандартов качества и точности."
    },
    {
      number: "04",
      title: "Доставка на объект",
      description: "Бережно доставляем изготовленные элементы дома до места строительства специализированным транспортом.",
      icon: <Truck className="h-8 w-8 text-primary" />,
      image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=2070&auto=format&fit=crop",
      details: "Организуем доставку всех элементов конструкции на строительную площадку с соблюдением всех требований к транспортировке."
    },
    {
      number: "05",
      title: "Сборка дома",
      description: "Профессиональная бригада осуществляет сборку конструкции дома на подготовленном фундаменте.",
      icon: <Hammer className="h-8 w-8 text-primary" />,
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop",
      details: "Опытные строители собирают конструкцию вашего дома с соблюдением всех строительных норм и технологий, обеспечивая высокое качество работ."
    },
    {
      number: "06",
      title: "Монтаж крыши",
      description: "Устанавливаем надежную кровельную систему, защищающую дом от любых погодных условий.",
      icon: <HomeIcon className="h-8 w-8 text-primary" />,
      image: "https://i.pinimg.com/736x/4a/f2/18/4af218f0ca321204e3a2ef85bcdf51d0.jpg", // updated image
      details: "Наши специалисты монтируют кровельную систему с использованием качественных материалов, обеспечивая надежную защиту вашего дома от осадков."
    },
    {
      number: "07",
      title: "Установка окон и дверей",
      description: "Завершаем внешний контур дома установкой энергосберегающих окон и надежных дверей.",
      icon: <DoorOpen className="h-8 w-8 text-primary" />,
      image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop",
      details: "Устанавливаем качественные окна и двери, которые обеспечивают хорошую теплоизоляцию и защиту вашего дома от внешних воздействий."
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6 md:mb-8 text-center">Этапы работы</h1>
          <div className="max-w-3xl">
            
          </div>
        </motion.div>

        {/* Modern Steps Layout */}
        <div className="mt-10 mb-16 space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
            >
              <div className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>
                <div className="w-full md:w-1/2">
                  <div className="relative">
                    <div className="absolute -left-4 -top-4 w-20 h-20 bg-primary/10 rounded-full z-0"></div>
                    <div className="relative z-10 rounded-2xl overflow-hidden aspect-[4/3] shadow-md">
                      <img 
                        src={step.image} 
                        alt={step.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -right-2 bottom-4 bg-primary text-white font-bold text-xl w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-20">
                      {step.number}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
                    <div className="flex items-center mb-4 gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {step.icon}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-primary">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">{step.description}</p>
                    <div className="bg-accent/20 p-4 rounded-lg">
                      <p className="text-sm">{step.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Construction Stages Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto my-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">Детальные этапы строительства</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {CONSTRUCTION_STAGES.map((stage, index) => (
                  <AccordionItem key={index} value={`stage-${index}`}>
                    <AccordionTrigger className="text-lg font-medium">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{index + 1}</span>
                        {stage}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-12 pt-2">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {WORK_TASKS[stage as keyof typeof WORK_TASKS]?.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-center gap-2">
                              <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground text-sm">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-br from-primary/5 to-accent/10 p-6 md:p-10 rounded-2xl text-center my-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 text-center">Готовы начать строительство?</h2>
          <p className="text-muted-foreground mb-6 max-w-3xl mx-auto text-center">
            Наши специалисты готовы ответить на все ваши вопросы и помочь подобрать оптимальное решение для строительства вашего дома.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg">
              Позвонить сейчас
            </Button>
            <Button variant="outline" size="lg">
              Заказать обратный звонок
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
};

export default Process;
