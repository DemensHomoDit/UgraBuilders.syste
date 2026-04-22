import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Консультация",
    description: "Встречаемся, слушаем вас. Обсуждаем участок, бюджет, сроки и пожелания. Показываем реализованные проекты, отвечаем на все вопросы. Никаких обязательств.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1000&auto=format&fit=crop&q=80",
    duration: "1–2 дня",
    color: "from-emerald-900",
  },
  {
    number: "02",
    title: "Проект",
    description: "Архитекторы разрабатывают проект под ваш участок и образ жизни. Согласовываем планировку, фасады, инженерные решения. Вносим правки до полного согласования.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&auto=format&fit=crop&q=80",
    duration: "2–4 недели",
    color: "from-slate-900",
  },
  {
    number: "03",
    title: "Договор и смета",
    description: "Фиксируем стоимость, сроки и объём работ в договоре. Детальная смета без скрытых платежей. Цена не меняется в процессе строительства.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1000&auto=format&fit=crop&q=80",
    duration: "2–3 дня",
    color: "from-zinc-900",
  },
  {
    number: "04",
    title: "Фундамент",
    description: "Проводим геологические изыскания, выбираем тип фундамента. Закладываем основание с учётом нагрузок и особенностей грунта Югры.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1000&auto=format&fit=crop&q=80",
    duration: "2–3 недели",
    color: "from-stone-900",
  },
  {
    number: "05",
    title: "Производство",
    description: "На собственном заводе изготавливаем термопанели и элементы каркаса по точным размерам проекта. Контроль качества на каждом этапе.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80",
    duration: "3–5 недель",
    color: "from-neutral-900",
  },
  {
    number: "06",
    title: "Монтаж",
    description: "Бригада собирает каркас и монтирует термопанели. Благодаря заводской точности сборка проходит быстро — коробка дома за 2–4 недели.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1000&auto=format&fit=crop&q=80",
    duration: "2–4 недели",
    color: "from-gray-900",
  },
  {
    number: "07",
    title: "Кровля и фасад",
    description: "Монтируем кровельную систему и выполняем внешнюю отделку. Материалы подбираются под климат — устойчивы к морозам и перепадам температур.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&auto=format&fit=crop&q=80",
    duration: "1–2 недели",
    color: "from-emerald-950",
  },
  {
    number: "08",
    title: "Инженерия и отделка",
    description: "Монтируем отопление, электрику, водоснабжение и вентиляцию. Все системы проектируются заранее и монтируются в строгой последовательности для максимальной эффективности.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&auto=format&fit=crop&q=80",
    duration: "4–8 недель",
    color: "from-slate-950",
  },
  {
    number: "09",
    title: "Сдача",
    description: "Финальная проверка всех систем. Подписываем акт приёмки, передаём ключи и полный пакет документации. Гарантия 10 лет на конструктив.",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1000&auto=format&fit=crop&q=80",
    duration: "1–2 дня",
    color: "from-zinc-950",
  },
];

export default function Process() {
  return (
    <main className="min-h-screen bg-white">
      {/* Цветная полоса сверху */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary/60" />
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="label-tag mb-5">Процесс</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight max-w-3xl leading-[1.06] mb-6">
              От идеи до ключей
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              9 этапов. Прозрачно, без сюрпризов.
              Вы знаете что происходит и сколько это займёт.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Этапы — сетка 3 колонки */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="group relative overflow-hidden rounded-3xl h-[320px] md:h-[360px] bg-gray-200 cursor-default">
                  {/* Фото */}
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />

                  {/* Градиент */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${step.color}/80 via-transparent to-transparent`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Номер вверху */}
                  <div className="absolute top-5 left-5">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                      {step.number}
                    </span>
                  </div>

                  {/* Длительность вверху справа */}
                  <div className="absolute top-5 right-5">
                    <span className="bg-white/15 backdrop-blur-sm text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/15">
                      {step.duration}
                    </span>
                  </div>

                  {/* Контент внизу */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 md:pb-24">
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
                Готовы начать?
              </h2>
              <p className="text-white/65 text-sm md:text-base max-w-md leading-relaxed">
                Позвоните или напишите — обсудим ваш проект и рассчитаем стоимость.
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
                Написать нам <ArrowUpRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
