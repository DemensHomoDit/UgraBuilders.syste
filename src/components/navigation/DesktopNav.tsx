import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ProjectsDropdown from "./ProjectsDropdown";
import { motion, AnimatePresence } from "framer-motion";

interface DesktopNavProps {
  isProjectsMenuOpen: boolean;
  setIsProjectsMenuOpen: (isOpen: boolean) => void;
  closeMenus?: () => void;
}

const DesktopNav = ({ isProjectsMenuOpen, setIsProjectsMenuOpen, closeMenus }: DesktopNavProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmenuOpen = (menu: string) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (closeMenus) closeMenus();
    setActiveSubmenu(null);
  };

  const menuItems = [
    {
      label: "Услуги",
      path: "/services",
      hasSubmenu: true,
      submenuId: "services",
      submenuItems: [
        { label: "Проектирование", path: "/services/design" },
        { label: "Строительство", path: "/services/construction" }
      ]
    },
    {
      label: "О компании",
      path: "/about",
      hasSubmenu: false
    },
    {
      label: "Этапы работы",
      path: "/process",
      hasSubmenu: false
    },
    {
      label: "Отзывы",
      path: "/reviews",
      hasSubmenu: false
    },
    {
      label: "Блог",
      path: "/blog",
      hasSubmenu: false
    },
    {
      label: "Контакты",
      path: "/contacts",
      hasSubmenu: false
    }
  ];

  return (
    <div className="flex space-x-6 xl:space-x-8">
      <ProjectsDropdown 
        isMenuOpen={isProjectsMenuOpen}
        onMenuOpen={setIsProjectsMenuOpen}
        onClose={closeMenus}
      />
      
      {menuItems.map((item) => (
        <div 
          key={item.label} 
          className="relative group"
          onMouseEnter={() => item.hasSubmenu && handleSubmenuOpen(item.submenuId)}
          onMouseLeave={() => item.hasSubmenu && handleSubmenuOpen(null)}
        >
          {item.hasSubmenu ? (
            <button className="text-primary/80 hover:text-primary transition-colors font-medium flex items-center gap-1">
              {item.label}
              <ChevronDown size={16} className={`transition-transform ${activeSubmenu === item.submenuId ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <Link 
              to={item.path} 
              className="text-primary/80 hover:text-primary transition-colors font-medium"
              onClick={() => closeMenus && closeMenus()}
            >
              {item.label}
            </Link>
          )}
          
          {item.hasSubmenu && (
            <AnimatePresence>
              {activeSubmenu === item.submenuId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-3 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="flex flex-col divide-y divide-gray-100">
                    {item.submenuItems?.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.path}
                        className="p-3 hover:bg-primary/5 transition-colors text-primary font-medium"
                        onClick={() => closeMenus && closeMenus()}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      ))}
    </div>
  );
};

export default DesktopNav;
