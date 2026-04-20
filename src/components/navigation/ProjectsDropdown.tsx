
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
        className="text-primary/80 hover:text-primary transition-colors font-medium flex items-center gap-1"
        onClick={() => isMobile && onMenuOpen(!isMenuOpen)}
      >
        Проекты домов
        <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`${isMobile ? "" : "absolute left-0"} mt-3 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50`}
          >
            <div className="flex flex-col divide-y divide-gray-100">
              <Link 
                to="/projects/standard" 
                className="p-4 hover:bg-primary/5 transition-colors"
                onClick={handleClose}
              >
                <div className="flex items-center gap-3">
                  <FolderCheck className="h-5 w-5 text-primary/70" />
                  <div>
                    <div className="font-medium text-primary">Серийные проекты</div>
                    <div className="text-xs text-muted-foreground mt-1">Готовые решения для быстрого старта</div>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/projects/custom" 
                className="p-4 hover:bg-primary/5 transition-colors"
                onClick={handleClose}
              >
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-primary/70" />
                  <div>
                    <div className="font-medium text-primary">Индивидуальные проекты</div>
                    <div className="text-xs text-muted-foreground mt-1">Уникальные дома по вашим пожеланиям</div>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/projects/commercial" 
                className="p-4 hover:bg-primary/5 transition-colors"
                onClick={handleClose}
              >
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary/70" />
                  <div>
                    <div className="font-medium text-primary">Коммерческие проекты</div>
                    <div className="text-xs text-muted-foreground mt-1">Офисы, магазины и бизнес-объекты</div>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/projects/gallery" 
                className="p-4 hover:bg-primary/5 transition-colors"
                onClick={handleClose}
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-primary/70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Z"></path>
                    <path d="M10 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5Z"></path>
                    <path d="M16 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5Z"></path>
                    <path d="M4 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z"></path>
                    <path d="M10 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2Z"></path>
                    <path d="M16 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2Z"></path>
                    <path d="M4 17a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z"></path>
                    <path d="M10 17a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2Z"></path>
                  </svg>
                  <div>
                    <div className="font-medium text-primary">Галерея наших работ</div>
                    <div className="text-xs text-muted-foreground mt-1">Фотографии реализованных проектов</div>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsDropdown;
