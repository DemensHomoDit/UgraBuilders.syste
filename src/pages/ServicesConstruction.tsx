import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactUsSection from "@/components/ContactUsSection";
import { motion } from "framer-motion";
import { HardHat, Hammer, CheckCircle, Clock, Shield, ListOrdered, AlertTriangle, Wrench, Wallet, CalendarClock } from "lucide-react";

const ServicesConstruction = () => {
  const buildServices = [
    {
      title: "Каркасные дома из термопанелей",
      description: "Возводим энергоэффективные и долговечные дома с применением запатентованной технологии термопанелей.",
      icon: <HardHat className="h-8 w-8 text-primary" />
    },
    {
      title: "Полный цикл работ",
      description: "Берём на себя все этапы — от фундамента и инженерных сетей до отделки и благоустройства участка.",
      icon: <Hammer className="h-8 w-8 text-primary" />
    },
    {
      title: "Гарантия 10 лет",
      description: "Предоставляем расширенную гарантию на конструктив и инженерные системы.",
      icon: <Shield className="h-8 w-8 text-primary" />
    },
    {
      title: "Контроль качества",
      description: "Технадзор проверяет каждый этап и фиксирует фото-отчёт в личном кабинете.",
      icon: <CheckCircle className="h-8 w-8 text-primary" />
    }
  ];

  const stages = [
    "Подготовка участка и фундамент",
    "Сборка каркаса и монтаж термопанелей",
    "Установка кровли и окон",
    "Монтаж инженерных систем",
    "Чистовая отделка и сдача объекта"
  ];

  const fears = [
    {
      title: "Стройка затянется",
      text: "Фиксируем график в договоре, применяем CPM-планирование и штрафные санкции за срыв сроков.",
      icon: <CalendarClock className="h-6 w-6 text-red-500" />
    },
    {
      title: "Смета вырастет по ходу работ",
      text: "Прозрачная смета с разбивкой по этапам; любые изменения согласуются дополнительным соглашением.",
      icon: <Wallet className="h-6 w-6 text-red-500" />
    },
    {
      title: "Качество будет ниже обещанного",
      text: "Многоуровневый технадзор и чек-листы; фото-отчёты доступны в личном кабинете клиента.",
      icon: <Wrench className="h-6 w-6 text-red-500" />
    },
    {
      title: "Останусь один на один с проблемами после сдачи",
      text: "10-летняя гарантия + сервисная служба, которая приедет в течение 48 часов при обращении.",
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO с фото и блюром */}
      <section className="relative h-[450px] sm:h-[550px] overflow-hidden flex items-center justify-center text-center text-white">
        {/* фоновое изображение с блюром */}
        <img
          src="https://i.pinimg.com/736x/c0/10/95/c0109566dad6d6558801b9c848c26624.jpg"
          alt="Строительство дома"
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
        />

        {/* полупрозрачный тёмный оверлей для читаемости текста */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-2xl px-4 text-center mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Строительство&nbsp;домов&nbsp;под&nbsp;ключ
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-xl mx-auto text-center">
            Современные энергоэффективные дома — полный цикл работ от фундамента до отделки.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Строительство домов</h1>
          <div className="max-w-3xl mx-auto md:mx-0">
            <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12">
              Мы строим современные тёплые дома «под ключ», используя собственные бригады, 
              проверенные материалы и прозрачную смету. Вы получаете готовое жильё точно в срок и без скрытых затрат.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {buildServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="mb-4 flex justify-center items-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                {service.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Опасения клиентов */}
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-primary mt-20 mb-8"
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
        >
          Что обычно беспокоит клиентов — и как мы решаем это
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fears.map((fear, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity:0, y:20 }}
              whileInView={{ opacity:1, y:0 }}
              transition={{ duration:0.5, delay:idx*0.1 }}
              viewport={{ once:true }}
              className="flex gap-4 bg-white border border-gray-100 p-6 rounded-xl shadow-sm"
            >
              <div className="shrink-0">{fear.icon}</div>
              <div>
                <h4 className="font-semibold text-primary mb-1">{fear.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{fear.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <ContactUsSection />
      </div>
      <Footer />
    </main>
  );
};

export default ServicesConstruction; 