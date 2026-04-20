
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle, Settings, Clock, HardHat, Home } from "lucide-react";

const Services = () => {
  const services = [
    {
      title: "Проектирование",
      description: "Создаем индивидуальные проекты домов с учетом всех ваших пожеланий и особенностей участка.",
      icon: <Settings className="h-8 w-8 text-primary" />
    },
    {
      title: "Строительство домов",
      description: "Строительство домов по каркасной технологии термопанелей под ключ с гарантией качества.",
      icon: <Home className="h-8 w-8 text-primary" />
    },
    {
      title: "Технический надзор",
      description: "Контроль качества строительства на всех этапах работ для обеспечения соответствия проекту.",
      icon: <HardHat className="h-8 w-8 text-primary" />
    },
    {
      title: "Быстрые сроки",
      description: "Строительство домов в сжатые сроки без потери качества благодаря отлаженным процессам.",
      icon: <Clock className="h-8 w-8 text-primary" />
    },
    {
      title: "Гарантийное обслуживание",
      description: "Предоставляем гарантию на все виды работ и обеспечиваем послестроительное обслуживание.",
      icon: <CheckCircle className="h-8 w-8 text-primary" />
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
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Наши услуги</h1>
          <div className="max-w-3xl mx-auto md:mx-0">
            <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12">
              Компания UgraBuilders предлагает полный спектр услуг по проектированию и строительству 
              домов по каркасной технологии термопанелей. Мы обеспечиваем комплексный подход к строительству, 
              от разработки проекта до сдачи дома "под ключ".
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 md:mt-16 bg-accent/10 p-6 md:p-8 rounded-xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Нужна консультация?</h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            Наши специалисты готовы ответить на все ваши вопросы и помочь выбрать 
            оптимальное решение для строительства вашего дома.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="tel:+78003331111" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 text-sm font-medium transition-colors"
            >
              Позвонить сейчас
            </a>
            <a 
              href="/contacts" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2 text-sm font-medium transition-colors"
            >
              Заказать обратный звонок
            </a>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
};

export default Services;
