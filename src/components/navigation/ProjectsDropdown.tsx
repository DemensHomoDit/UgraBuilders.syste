
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FolderCheck, Home, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectsDropdownProps {
  isMenuOpen: boolean;
  onMenuOpen: (isOpen: boolean) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const ProjectsDropdown = ({ isMenuOpen, onMenuOpen, onClose, isMobile = false }: ProjectsDropdownProps) => {
  const handleClose = () => {
    onClose?.();
  };

  return (
    <div 
      className={`${isMobile ? "" : "relative group"}`}
      onMouseEnter={() => !isMobile && onMenuOpen(true)}
      onMouseLeave={() => !isMobile && onMenuOpen(false)}
    >
      <button 
        className="flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
        onClick={() => isMobile && onMenuOpen(!isMenuOpen)}
      >
        Проекты домов
        <ChevronDown size={13} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`${isMobile ? "" : "absolute left-0"} mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden z-50 py-1.5`}
          >
            {[
              { to: "/projects/standard", Icon: FolderCheck, label: "Серийные проекты", sub: "Готовые решения" },
              { to: "/projects/custom", Icon: Home, label: "Индивидуальные проекты", sub: "Уникальные дома" },
              { to: "/projects/commercial", Icon: Building, label: "Коммерческие проекты", sub: "Офисы и бизнес-объекты" },
            ].map(({ to, Icon, label, sub }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={handleClose}
              >
                <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-gray-800">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                </div>
              </Link>
            ))}
            <div className="mx-3 my-1 border-t border-gray-100" />
            <Link to="/projects/gallery"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={handleClose}
            >
              <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-gray-800">Галерея работ</div>
                <div className="text-xs text-gray-400 mt-0.5">Реализованные проекты</div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsDropdown;
