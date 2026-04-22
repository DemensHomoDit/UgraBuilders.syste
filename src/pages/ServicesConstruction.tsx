import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactUsSection from "@/components/ContactUsSection";
import { motion } from "framer-motion";
import { HardHat, Hammer, CheckCircle, Shield, Wrench, Wallet, CalendarClock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: HardHat,
    title: "Собственное производство",
    description: "Термопанели и элементы каркаса изготавливаем на собственном заводе. Никаких посредников — полный контроль качества от сырья до готовой панели.",
  },
  {
    icon: Hammer,
    title: "Строим сами",
    description: "Собственные бригады без субподрядчиков. Каждый строитель — штатный сотрудник с опытом от 5 лет. Мы отвечаем за каждый гвоздь.",
  },
  {
    icon: Shield,
    title: "Гарантия 10 лет",
    description: "Можем давать такую гарантию, потому что сами производим материалы и сами строим. Сервисная служба приедет в течение 48 часов.",
  },
  {
    icon: CheckCircle,
    title: "Прозрачный контроль",
    description: "Технадзор фиксирует каждый этап. Фото-отчёты в реальном времени доступны в вашем личном кабинете.",
  },
];

const fears = [
  { icon: CalendarClock, title: "Стройка затянется", text: "Фиксируем график в договоре, применяем CPM-планирование и штрафные санкции за срыв сроков." },
  { icon: Wallet, title: "Смета вырастет по ходу работ", text: "Прозрачная смета с разбивкой по этапам. Любые изменения согласуются дополнительным соглашением." },
  { icon: Wrench, title: "Качество будет ниже обещанного", text: "Многоуровневый технадзор и чек-листы. Фото-отчёты доступны в личном кабинете клиента." },
  { icon: AlertTriangle, title: "Останусь один с проблемами после сдачи", text: "10-летняя гарантия + сервисная служба, которая приедет в течение 48 часов при обращении." },
];

export default function ServicesConstruction() {
  return (
    <main className="min-h-screen bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary/60" />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&auto=format&fit=crop&q=80"
          alt="Строительство домов"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-16">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8 w-full">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Услуги / Строительство</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-2xl leading-[1.08] mb-4">
                Строим сами. На своём производстве.
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-xl leading-relaxed">
                Собственный завод термопанелей и собственные бригады — никаких посредников, полная ответственность за результат.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Описание */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="label-tag mb-5">О направлении</p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Мы не нанимаем субподрядчиков. Термопанели производим на собственном заводе,
              строим собственными бригадами. Это позволяет контролировать качество на каждом этапе
              и давать гарантию 10 лет — не на словах, а в договоре.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Возможности */}
      <section className="pb-16 md:pb-20 bg-gray-50/60">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10">
            <p className="label-tag mb-4">Что входит</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Наши возможности</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="bg-white rounded-3xl p-7 border border-gray-100/80 hover:shadow-[0_8px_40px_rgba(0,0,0,0.07)] transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Опасения */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10">
            <p className="label-tag mb-4">Ваши вопросы</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Что обычно беспокоит клиентов</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fears.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-5 bg-white border border-gray-100/80 rounded-3xl p-7"
                >
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 tracking-tight">{f.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Форма */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <ContactUsSection />
        </div>
      </section>

      <Footer />
    </main>
  );
}
