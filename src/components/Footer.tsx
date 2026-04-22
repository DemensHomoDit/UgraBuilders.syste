import { Mail, Phone, Instagram, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-950 text-white overflow-hidden">
      {/* CTA блок */}
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 pt-16 md:pt-20 pb-14 md:pb-16 border-b border-white/8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">
              Начните сегодня
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-lg leading-tight">
              Готовы построить дом вашей мечты?
            </h2>
          </div>
          <button
            onClick={() => navigate("/contacts")}
            className="flex-shrink-0 flex items-center gap-3 bg-white text-gray-900 text-sm font-bold px-7 py-4 rounded-2xl hover:bg-white/95 active:scale-[0.98] transition-all shadow-xl"
          >
            Получить консультацию
            <ArrowUpRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Ссылки */}
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Бренд */}
          <div className="col-span-2 md:col-span-2">
            <div className="text-xl font-bold mb-4 tracking-tight">UgraBuilders</div>
            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
              Строительство домов по каркасной технологии в Югре с 2009 года.
            </p>
            <div className="flex gap-2.5">
              {[
                { href: "https://instagram.com", icon: <Instagram size={15} /> },
                {
                  href: "https://vk.com/ugrabuilders",
                  icon: (
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M4.447 3C3.09 3 1.6 3.497 1.6 5.177v13.646C1.6 20.503 3.089 21 4.447 21h15.106c1.358 0 2.847-.497 2.847-2.177V5.177C22.4 3.497 20.911 3 19.553 3H4.447zm12.009 13.273h-1.778c-.356 0-.616-.29-.83-.635-.236-.383-.46-.774-.684-1.163-.236-.414-.517-.612-.916-.612-.676 0-.901.282-.901 1.003v2.023c0 .682-.129.791-.781.791H9.58c-.713 0-.836-.289-.836-1.003V8.213c0-.627.237-.84.8-.84h1.776c.594 0 .799.23.799.841V10.2c0 .756.111.861.705.861h.532c.651 0 .799-.127.997-.49.27-.512.508-1.036.775-1.543.216-.403.495-.567.917-.567h1.776c.611 0 .757.309.594.806-.184.557-.531 1.206-1.098 2.133-.753 1.203-.754 1.01-.092 2.205.457.835.963 1.623 1.413 2.46.28.535.154.967-.49.967z" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Проекты */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-5">Проекты</div>
            <ul className="space-y-3">
              {[["Серийные", "/projects/standard"], ["Индивидуальные", "/projects/custom"], ["Коммерческие", "/projects/commercial"], ["Галерея", "/projects/gallery"]].map(([l, p]) => (
                <li key={p}><Link to={p} className="text-sm text-white/50 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Компания */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-5">Компания</div>
            <ul className="space-y-3">
              {[["О нас", "/about"], ["Этапы работы", "/process"], ["Отзывы", "/reviews"], ["Блог", "/blog"], ["Контакты", "/contacts"]].map(([l, p]) => (
                <li key={p}><Link to={p} className="text-sm text-white/50 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-5">Контакты</div>
            <ul className="space-y-3.5">
              <li>
                <a href="tel:+78003331111" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                  <Phone size={13} className="text-primary/60" /> 8 800 333-11-11
                </a>
              </li>
              <li>
                <a href="mailto:info@ugrabuilders.ru" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                  <Mail size={13} className="text-primary/60" /> info@ugrabuilders.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Низ */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-12 mt-12 border-t border-white/8 text-xs text-white/20">
          <span>© {year} UgraBuilders. Все права защищены.</span>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white/40 transition-colors">Политика конфиденциальности</Link>
            <Link to="/terms" className="hover:text-white/40 transition-colors">Условия использования</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
