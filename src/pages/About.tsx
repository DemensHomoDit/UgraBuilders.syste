import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyChooseUsSection from "@/components/about/WhyChooseUsSection";
import { Building2, Target, Users2, Layers, Square, CornerUpRight, ArrowDownToLine, ArrowUpRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const About = () => {
  const technologyComponents = [
    {
      id: "thermal_panels",
      title: "Термопанели",
      description: "Высокоэффективные термопанели с превосходной теплоизоляцией",
      icon: <Layers className="w-5 h-5" />,
      image: "https://i.pinimg.com/736x/69/60/2b/69602b30554690758fcc3fbecb118b2d.jpg",
      keyPoints: ["Максимальная теплоизоляция","Быстрый монтаж","Долговечность материалов","Экологическая безопасность","Отсутствие мостиков холода","Высокая прочность конструкции","Идеальная геометрия","Энергоэффективность класса А+"]
    },
    {
      id: "window_panels",
      title: "Оконные панели",
      description: "Интегрированные оконные системы с повышенной энергоэффективностью",
      icon: <Square className="w-5 h-5" />,
      image: "https://i.pinimg.com/736x/00/7d/ea/007dea0f6b8d8def0a79e15f3c8f064a.jpg",
      keyPoints: ["Заводская установка окон","Гарантированная герметичность","Высокая светопропускаемость","Энергосберегающие стеклопакеты","Отличная шумоизоляция","Защита от промерзания","Легкость в уходе","Долговечность"]
    },
    {
      id: "thermal_corners",
      title: "Термоуглы",
      description: "Специальные угловые элементы для устранения мостиков холода",
      icon: <CornerUpRight className="w-5 h-5" />,
      image: "https://i.pinimg.com/736x/69/60/2b/69602b30554690758fcc3fbecb118b2d.jpg",
      keyPoints: ["Отсутствие мостиков холода","Простота монтажа","Надёжное соединение","Эстетичный внешний вид","Высокая прочность","Идеальная геометрия углов","Защита от промерзания","Долговечность конструкции"]
    },
    {
      id: "base_beams",
      title: "Лежни",
      description: "Усиленные опорные конструкции для надёжного основания",
      icon: <ArrowDownToLine className="w-5 h-5" />,
      image: "https://st41.stpulscen.ru/images/product/361/318/296_original.jpg",
      keyPoints: ["Равномерное распределение нагрузки","Высокая несущая способность","Защита от влаги","Точность монтажа","Прочный фундамент","Устойчивость к деформациям","Простота установки","Долговечность"]
    }
  ];

  const companyValues = [
    { icon: <Target className="w-6 h-6 text-primary" />, title: "Наша миссия", description: "Создавать дома, в которых воплощаются мечты наших клиентов, используя инновационные технологии и высочайшие стандарты качества." },
    { icon: <Users2 className="w-6 h-6 text-primary" />, title: "Наша команда", description: "Опытные специалисты с многолетним стажем, которые относятся к строительству вашего дома как к собственному." },
    { icon: <Building2 className="w-6 h-6 text-primary" />, title: "Наш подход", description: "Индивидуальный подход к каждому проекту с гарантией качества и соблюдением всех технологических стандартов." }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="label-tag mb-5">О компании</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight max-w-3xl leading-[1.08] mb-6">
              Строим будущее вашей семьи
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Мы создаём пространство для счастливой жизни, используя передовые технологии
              и проверенные временем решения. Ваш дом будет тёплым, комфортным и энергоэффективным.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ценности */}
      <section className="py-20 md:py-24 bg-gray-50/60">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
            <p className="label-tag mb-4">Ценности</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Что нами движет</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {companyValues.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-gray-100/80"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Технология */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
            <p className="label-tag mb-4">Технология</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Наша уникальная технология</h2>
          </motion.div>

          <Tabs defaultValue="thermal_panels" className="w-full">
            <TabsList className="flex flex-wrap gap-2 mb-10 bg-transparent p-0 h-auto">
              {technologyComponents.map((tech) => (
                <TabsTrigger key={tech.id} value={tech.id}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                    "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm",
                    "data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
                  )}
                >
                  {tech.icon}
                  <span>{tech.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {technologyComponents.map((tech) => (
              <TabsContent key={tech.id} value={tech.id} className="focus-visible:outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">{tech.title}</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">{tech.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tech.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-primary">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100">
                    <img src={tech.image} alt={tech.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <WhyChooseUsSection />
      <Footer />
    </main>
  );
};

export default About;
