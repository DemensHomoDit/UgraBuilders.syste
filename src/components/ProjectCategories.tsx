import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const cats = [
  {
    title: "Серийные проекты",
    desc: "Более 80 готовых проектов домов от 80 до 400 м²",
    img: "https://i.pinimg.com/1200x/db/e1/ab/dbe1ab1308ac0991f17d04e2320b80c7.jpg",
    url: "/projects/standard",
    tag: "от 3 500 000 ₽",
    count: "80+ проектов",
  },
  {
    title: "Индивидуальные проекты",
    desc: "Уникальный дом под ваш участок, климат и образ жизни",
    img: "/1.png.jpg",
    url: "/projects/custom",
    tag: "Индивидуально",
    count: "Любой бюджет",
  },
  {
    title: "Коммерческие объекты",
    desc: "Офисы, магазины, производственные здания любого масштаба",
    img: "https://i.pinimg.com/1200x/d5/81/0d/d5810de6f9760c14174c58ac48ed5fa1.jpg",
    url: "/projects/commercial",
    tag: "Бизнес",
    count: "Любой масштаб",
  },
];

export default function ProjectCategories() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1320px] mx-auto px-5 md:px-8">
        {/* Шапка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12 md:mb-16"
        >
          <div>
            <p className="label-tag mb-4">Направления</p>
            <h2 className="text-4xl md:text-5xl text-gray-900 tracking-tight">
              Дома по каркасной<br className="hidden md:block" /> технологии
            </h2>
          </div>
          <Link to="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
          >
            Все проекты <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        {/* Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {cats.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={c.url} className="group block">
                {/* Фото */}
                <div className="relative overflow-hidden rounded-3xl aspect-[3/2] mb-5 bg-gray-100">
                  <img src={c.img} alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {/* Тег */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                    {c.tag}
                  </div>
                  {/* Кнопка */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 shadow-sm">
                    <ArrowUpRight size={16} className="text-gray-800" />
                  </div>
                </div>

                {/* Текст */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">{c.count}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
