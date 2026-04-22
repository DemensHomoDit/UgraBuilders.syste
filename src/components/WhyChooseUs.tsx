import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Shield, Clock, Users, Star, Banknote, Snowflake } from "lucide-react";

const items = [
  { icon: Star, title: "Качество материалов", text: "Только сертифицированные материалы. Многоэтапный контроль на каждом этапе.", link: "/about" },
  { icon: Clock, title: "Точные сроки", text: "Сроки фиксируются в договоре. 15 лет — ни одного серьёзного опоздания.", link: "/process" },
  { icon: Users, title: "Опытная команда", text: "120+ специалистов в штате. Архитекторы, инженеры, строители.", link: "/about" },
  { icon: Shield, title: "Гарантия 10 лет", text: "Расширенная гарантия на конструктив и инженерные системы.", link: "/services" },
  { icon: Banknote, title: "Прозрачная смета", text: "Детальная смета без скрытых платежей. Цена фиксируется в договоре.", link: "/contacts" },
  { icon: Snowflake, title: "Климат Югры", text: "Знаем нюансы северного строительства. Проектируем для суровых зим.", link: "/services" },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-gray-50/60">
      <div className="max-w-[1320px] mx-auto px-5 md:px-8">
        {/* Шапка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-14"
        >
          <div>
            <p className="label-tag mb-4">Преимущества</p>
            <h2 className="text-4xl md:text-5xl text-gray-900 tracking-tight max-w-md">
              Почему выбирают UgraBuilders
            </h2>
          </div>
          <Link to="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
          >
            О компании <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        {/* Сетка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={item.link}
                  className="group flex flex-col gap-4 bg-white rounded-3xl p-7 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 h-full border border-gray-100/80"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 tracking-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
