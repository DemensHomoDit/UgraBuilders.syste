
import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyChooseUsSection from "@/components/about/WhyChooseUsSection";
import { Building2, Target, Users2, Layers, Square, CornerUpRight, ArrowDownToLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const About = () => {
  const technologyComponents = [
    {
      id: "thermal_panels",
      title: "Термопанели",
      description: "Высокоэффективные термопанели с превосходной теплоизоляцией",
      icon: <Layers className="w-6 h-6" />,
      image: "https://i.pinimg.com/736x/69/60/2b/69602b30554690758fcc3fbecb118b2d.jpg",
      keyPoints: [
        "Максимальная теплоизоляция",
        "Быстрый монтаж",
        "Долговечность материалов",
        "Экологическая безопасность",
        "Отсутствие мостиков холода",
        "Высокая прочность конструкции",
        "Идеальная геометрия",
        "Энергоэффективность класса А+"
      ]
    },
    {
      id: "window_panels",
      title: "Оконные панели",
      description: "Интегрированные оконные системы с повышенной энергоэффективностью",
      icon: <Square className="w-6 h-6" />,
      image: "https://i.pinimg.com/736x/00/7d/ea/007dea0f6b8d8def0a79e15f3c8f064a.jpg",
      keyPoints: [
        "Заводская установка окон",
        "Гарантированная герметичность",
        "Высокая светопропускаемость",
        "Энергосберегающие стеклопакеты",
        "Отличная шумоизоляция",
        "Защита от промерзания",
        "Легкость в уходе",
        "Долговечность"
      ]
    },
    {
      id: "thermal_corners",
      title: "Термоуглы",
      description: "Специальные угловые элементы для устранения мостиков холода",
      icon: <CornerUpRight className="w-6 h-6" />,
      image: "/path-to-thermal-corners-image.jpg",
      keyPoints: [
        "Отсутствие мостиков холода",
        "Простота монтажа",
        "Надёжное соединение",
        "Эстетичный внешний вид",
        "Высокая прочность",
        "Идеальная геометрия углов",
        "Защита от промерзания",
        "Долговечность конструкции"
      ]
    },
    {
      id: "base_beams",
      title: "Лежни",
      description: "Усиленные опорные конструкции для надёжного основания",
      icon: <ArrowDownToLine className="w-6 h-6" />,
      image: "https://st41.stpulscen.ru/images/product/361/318/296_original.jpg",
      keyPoints: [
        "Равномерное распределение нагрузки",
        "Высокая несущая способность",
        "Защита от влаги",
        "Точность монтажа",
        "Прочный фундамент",
        "Устойчивость к деформациям",
        "Простота установки",
        "Долговечность"
      ]
    }
  ];

  const companyValues = [
    {
      icon: <Target className="w-8 h-8 text-primary mb-4" />,
      title: "Наша миссия",
      description: "Создавать дома, в которых воплощаются мечты наших клиентов, используя инновационные технологии и высочайшие стандарты качества."
    },
    {
      icon: <Users2 className="w-8 h-8 text-primary mb-4" />,
      title: "Наша команда",
      description: "Опытные специалисты с многолетним стажем, которые относятся к строительству вашего дома как к собственному."
    },
    {
      icon: <Building2 className="w-8 h-8 text-primary mb-4" />,
      title: "Наш подход",
      description: "Индивидуальный подход к каждому проекту с гарантией качества и соблюдением всех технологических стандартов."
    }
  ];

  const buildingAdvantages = [
    {
      icon: <Layers className="w-6 h-6 text-primary" />,
      title: "Технологичность",
      description: "Используем передовые строительные технологии и материалы для создания качественных домов."
    },
    {
      icon: <Square className="w-6 h-6 text-primary" />,
      title: "Надёжность",
      description: "Все конструкции проходят тщательное тестирование и имеют длительный срок службы."
    },
    {
      icon: <CornerUpRight className="w-6 h-6 text-primary" />,
      title: "Энергоэффективность",
      description: "Наши дома обеспечивают превосходную теплоизоляцию и экономию на отоплении."
    },
    {
      icon: <ArrowDownToLine className="w-6 h-6 text-primary" />,
      title: "Долговечность",
      description: "Срок службы наших домов составляет более 100 лет при правильной эксплуатации."
    }
  ];

  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-transparent pt-40 pb-24 flex items-center justify-center text-center">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-center mx-auto">Строим будущее вашей семьи</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
                Мы создаем пространство для счастливой жизни, используя передовые технологии 
                и проверенные временем решения. Ваш дом будет теплым, комфортным и энергоэффективным.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12 leading-tight">
              Наши ценности
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {companyValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="mb-4 p-3 rounded-full bg-primary/10">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3 leading-tight text-center">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-center">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12 leading-tight">
              Наша уникальная технология
            </h2>
            
            <Tabs defaultValue="thermal_panels" className="w-full">
              <TabsList className="flex flex-wrap justify-center mb-12 bg-background/50 p-2 rounded-full">
                {technologyComponents.map((tech) => (
                  <TabsTrigger
                    key={tech.id}
                    value={tech.id}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-full transition-all",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    )}
                  >
                    {tech.icon}
                    <span className="hidden md:inline">{tech.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {technologyComponents.map((tech) => (
                <TabsContent key={tech.id} value={tech.id} className="focus-visible:outline-none">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight">{tech.title}</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">{tech.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tech.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="mt-1 text-primary">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-5 h-5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <span className="text-muted-foreground leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                      <img
                        src={tech.image}
                        alt={tech.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Building Advantages */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
                Преимущества строительства
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {buildingAdvantages.map((advantage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                            {advantage.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                            <p className="text-muted-foreground">{advantage.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WhyChooseUsSection */}
        <WhyChooseUsSection />
      </div>

      <Footer />
    </main>
  );
};

export default About;
