import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Ruler, PencilLine, Map, Lightbulb, ShieldCheck, Users, Award, AlertTriangle, Wallet, Layout, ClipboardCheck } from "lucide-react";
import ContactUsSection from "@/components/ContactUsSection";

const ServicesDesign = () => {
  const designServices = [
    {
      title: "Архитектурная концепция",
      description: "Вместе с вами формируем образ будущего дома, подбираем планировку и стиль.",
      icon: <PencilLine className="h-8 w-8 text-primary" />
    },
    {
      title: "Инженерные решения",
      description: "Сразу закладываем надёжные коммуникации и энергоэффективность здания.",
      icon: <Lightbulb className="h-8 w-8 text-primary" />
    }
  ];

  const designAdvantages = [
    {
      title: "Глубокая экспертиза",
      description: "10+ лет опыта проектирования каркасных и кирпичных домов в условиях Севера.",
      icon: <ShieldCheck className="h-8 w-8 text-primary" />
    },
    {
      title: "Команда профи",
      description: "Инженеры-конструкторы, архитектор, BIM-координатор, дизайнер интерьеров.",
      icon: <Users className="h-8 w-8 text-primary" />
    },
    {
      title: "Авторский надзор",
      description: "Сопровождаем проект до ввода дома в эксплуатацию и отвечаем за соответствие.",
      icon: <Award className="h-8 w-8 text-primary" />
    }
  ];

  const fears = [
    {
      title: "Бюджет выйдет из-под контроля",
      text: "Предварительно фиксируем стоимость проектирования в договоре и не меняем её, если ТЗ остаётся тем же.",
      icon: <Wallet className="h-6 w-6 text-red-500" />
    },
    {
      title: "Дом будет неудобным",
      text: "Мы погружаемся в ваше ежедневное расписание и разрабатываем 2-3 планировки, чтобы выбрать идеальную.",
      icon: <Layout className="h-6 w-6 text-red-500" />
    },
    {
      title: "Трудно будет согласовать проект",
      text: "Подготовим полный комплект исходно-разрешительной документации и поможем пройти экспертизу.",
      icon: <ClipboardCheck className="h-6 w-6 text-red-500" />
    },
    {
      title: "Строители не разберутся в чертежах",
      text: "Выдадим подробную BIM-модель и спецификации; нашу поддержку можно получить даже на стройплощадке по видеосвязи.",
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
          src="https://i.pinimg.com/736x/ca/52/e5/ca52e52d1f650341b77b0854e41b58cc.jpg"
          alt="Проектирование домов"
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
        />

        {/* полупрозрачный тёмный оверлей для читаемости текста */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-2xl px-4 text-center mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Профессиональное&nbsp;проектирование&nbsp;домов
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-xl mx-auto text-center">
            От идеи до рабочей документации – все разделы в одном месте.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8">Проектирование домов</h1>
          <div className="max-w-3xl mx-auto md:mx-0">
            <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12">
              Наш отдел проектирования превращает ваши идеи в профессионально проработанный проект, готовый к реализации. 
              Мы учитываем климатические особенности региона, нормативы и ваш образ жизни, чтобы дом получился комфортным, 
              долговечным и экономичным.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {designServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="mb-4 flex justify-center items-center w-12 h-12 rounded-full bg-primary/10 text-primary">{service.icon}</div>
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
          Мы заранее снимаем ваши опасения
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

export default ServicesDesign; 