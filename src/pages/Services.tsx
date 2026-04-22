import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Проектирование",
    subtitle: "Архитектура и дизайн",
    description: "Создаём проект дома с нуля или адаптируем готовый под ваш участок. Учитываем климат Югры, рельеф, ориентацию по сторонам света и ваш образ жизни. Полный комплект документации для строительства.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80",
    link: "/services/design",
  },
  {
    title: "Строительство",
    subtitle: "Каркасная технология",
    description: "Возводим дома из термопанелей собственного производства. Высокая теплоизоляция, точность заводского изготовления и быстрый монтаж — дом собирается как конструктор без лишних отходов.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&auto=format&fit=crop&q=80",
    link: "/services/construction",
  },
  {
    title: "Инженерные системы",
    subtitle: "Отопление, электрика, вентиляция",
    description: "Проектируем и монтируем все инженерные системы в комплексе. Тёплые полы, рекуперация воздуха, умный дом — всё это закладывается на этапе проекта, а не добавляется потом.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80",
    link: "/contacts",
  },
  {
    title: "Отделочные работы",
    subtitle: "Интерьер и фасад",
    description: "Выполняем внутреннюю и внешнюю отделку по согласованному дизайн-проекту. Работаем с любыми материалами — от скандинавского минимализма до классики.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80",
    link: "/contacts",
  },
  {
    title: "Гарантия и сервис",
    subtitle: "10 лет на конструктив",
    description: "После сдачи объекта остаёмся на связи. Гарантия 10 лет на несущие конструкции, сервисное обслуживание инженерных систем и оперативное устранение любых замечаний.",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&auto=format&fit=crop&q=80",
    link: "/contacts",
  },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-white">
      {/* Цветная полоса сверху */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary/60" />
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="label-tag mb-5">Услуги</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight max-w-3xl leading-[1.06] mb-6">
              Строим. Проектируем. Обслуживаем.
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              Полный цикл — от первого эскиза до передачи ключей.
              Работаем в Югре с 2009 года.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Услуги — сетка как на Этапах */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={s.link} className="group relative block overflow-hidden rounded-3xl h-[320px] md:h-[380px] bg-gray-200">
                  {/* Фото */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  {/* Градиент */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Subtitle вверху */}
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/15 backdrop-blur-sm text-white/80 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/15">
                      {s.subtitle}
                    </span>
                  </div>

                  {/* Стрелка вверху справа */}
                  <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowUpRight size={15} className="text-white" />
                  </div>

                  {/* Контент внизу */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                      {s.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary rounded-3xl px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                Расскажите о вашем проекте
              </h2>
              <p className="text-white/65 text-sm md:text-base max-w-md leading-relaxed">
                Позвоните или напишите — обсудим задачу, подберём решение и рассчитаем стоимость.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a href="tel:+78003331111"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary text-sm font-bold px-7 py-4 rounded-2xl hover:bg-white/95 active:scale-[0.98] transition-all"
              >
                Позвонить
              </a>
              <Link to="/contacts"
                className="inline-flex items-center justify-center gap-2 bg-white/12 text-white text-sm font-medium px-7 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
              >
                Написать нам
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
