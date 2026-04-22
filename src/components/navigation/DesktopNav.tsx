import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ProjectsDropdown from "./ProjectsDropdown";
import { motion, AnimatePresence } from "framer-motion";

interface DesktopNavProps {
  isProjectsMenuOpen: boolean;
  setIsProjectsMenuOpen: (isOpen: boolean) => void;
  closeMenus?: () => void;
  side?: "left" | "right" | "all";
}

const leftItems = [
  { label: "Проекты", id: "projects", isProjects: true },
  {
    label: "Услуги",
    path: "/services",
    hasSubmenu: true,
    submenuId: "services",
    submenuItems: [
      { label: "Проектирование", path: "/services/design" },
      { label: "Строительство", path: "/services/construction" },
    ],
  },
  { label: "О компании", path: "/about" },
];

const rightItems = [
  { label: "Этапы работы", path: "/process" },
  { label: "Отзывы", path: "/reviews" },
  { label: "Блог", path: "/blog" },
  { label: "Контакты", path: "/contacts" },
];

const navLinkClass =
  "text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200";

const DesktopNav = ({
  isProjectsMenuOpen,
  setIsProjectsMenuOpen,
  closeMenus,
  side = "all",
}: DesktopNavProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const renderItem = (item: any) => {
    if (item.isProjects) {
      return (
        <ProjectsDropdown
          key="projects"
          isMenuOpen={isProjectsMenuOpen}
          onMenuOpen={setIsProjectsMenuOpen}
          onClose={closeMenus}
        />
      );
    }

    if (item.hasSubmenu) {
      return (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => setActiveSubmenu(item.submenuId)}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <button className={`${navLinkClass} flex items-center gap-1`}>
            {item.label}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${activeSubmenu === item.submenuId ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {activeSubmenu === item.submenuId && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1"
              >
                {item.submenuItems?.map((sub: any) => (
                  <Link
                    key={sub.label}
                    to={sub.path}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => closeMenus?.()}
                  >
                    {sub.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path}
        className={navLinkClass}
        onClick={() => closeMenus?.()}
      >
        {item.label}
      </Link>
    );
  };

  const items =
    side === "left" ? leftItems : side === "right" ? rightItems : [...leftItems, ...rightItems];

  return (
    <div className="flex items-center gap-7">
      {items.map((item) => renderItem(item))}
    </div>
  );
};

export default DesktopNav;
