import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavLogo from "./navigation/NavLogo";
import MobileNav from "./navigation/MobileNav";
import ProjectsDropdown from "./navigation/ProjectsDropdown";
import { ChevronDown, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Проекты", isProjects: true },
  {
    label: "Услуги", path: "/services",
    sub: [
      { label: "Проектирование", path: "/services/design" },
      { label: "Строительство", path: "/services/construction" },
    ],
  },
  { label: "О нас", path: "/about" },
  { label: "Этапы", path: "/process" },
  { label: "Отзывы", path: "/reviews" },
  { label: "Блог", path: "/blog" },
  { label: "Контакты", path: "/contacts" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const closeAll = () => { setMenuOpen(false); setProjectsOpen(false); setActiveSub(null); };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]" : "bg-white"
      }`}>
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 flex items-center justify-between h-[68px]">

          {/* Логотип */}
          <NavLogo closeMenus={closeAll} />

          {/* Десктоп навигация */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              if (item.isProjects) return (
                <ProjectsDropdown key="p" isMenuOpen={projectsOpen} onMenuOpen={setProjectsOpen} onClose={closeAll} />
              );
              if (item.sub) return (
                <div key={item.label} className="relative"
                  onMouseEnter={() => setActiveSub(item.label)}
                  onMouseLeave={() => setActiveSub(null)}
                >
                  <button className="flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">
                    {item.label}
                    <ChevronDown size={13} className={`transition-transform duration-200 ${activeSub === item.label ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeSub === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden py-1.5 z-50"
                      >
                        {item.sub.map(s => (
                          <Link key={s.path} to={s.path}
                            className="block px-4 py-2.5 text-[13px] text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                            onClick={closeAll}
                          >{s.label}</Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
              return (
                <Link key={item.label} to={item.path!}
                  className="px-3.5 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
                  onClick={closeAll}
                >{item.label}</Link>
              );
            })}
          </nav>

          {/* Правая часть */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+78003331111" className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-primary transition-colors">
              <Phone size={13} />
              8 800 333-11-11
            </a>
            <button
              onClick={() => { navigate("/account"); closeAll(); }}
              className="text-[13px] font-semibold px-5 py-2.5 rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-all"
            >
              Войти
            </button>
            <button
              onClick={() => { navigate("/contacts"); closeAll(); }}
              className="bg-primary text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Заказать звонок
            </button>
          </div>

          {/* Мобильное */}
          <div className="lg:hidden">
            <MobileNav isMenuOpen={menuOpen} setIsMenuOpen={setMenuOpen}
              isProjectsMenuOpen={projectsOpen} setIsProjectsMenuOpen={setProjectsOpen}
              closeMenus={closeAll} />
          </div>
        </div>
      </header>
      <div className="h-[68px]" />
    </>
  );
}
