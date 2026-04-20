import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Phone, X, UserRound, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectsDropdown from "./ProjectsDropdown";

interface MobileNavProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isProjectsMenuOpen: boolean;
  setIsProjectsMenuOpen: (isOpen: boolean) => void;
  closeMenus: () => void;
}

const MobileNav = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  isProjectsMenuOpen, 
  setIsProjectsMenuOpen,
  closeMenus 
}: MobileNavProps) => {
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleSubmenu = (id: string) => {
    setExpandedSubmenu(expandedSubmenu === id ? null : id);
  };

  const handleCallRequest = () => {
    navigate('/contacts');
    closeMenus();
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
    <>
      <div className="flex md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
              <div className="border-b border-gray-100 pb-2">
                <ProjectsDropdown 
                  isMenuOpen={isProjectsMenuOpen}
                  onMenuOpen={setIsProjectsMenuOpen}
                  onClose={closeMenus}
                  isMobile={true}
                />
              </div>
              
              {menuItems.map((item) => (
                <div key={item.label} className="border-b border-gray-100 pb-2">
                  {item.hasSubmenu ? (
                    <>
                      <button 
                        className="text-primary/80 hover:text-primary py-2 font-medium w-full flex items-center justify-between" 
                        onClick={() => toggleSubmenu(item.submenuId)}
                      >
                        <span>{item.label}</span>
                        {expandedSubmenu === item.submenuId ? 
                          <ChevronDown size={20} /> : 
                          <ChevronRight size={20} />
                        }
                      </button>
                      
                      <AnimatePresence>
                        {expandedSubmenu === item.submenuId && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 mt-1"
                          >
                            {item.submenuItems?.map((subItem) => (
                              <Link
                                key={subItem.label}
                                to={subItem.path}
                                className="block py-2 text-primary/80 hover:text-primary"
                                onClick={closeMenus}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link 
                      to={item.path} 
                      className="text-primary/80 hover:text-primary py-2 font-medium block" 
                      onClick={closeMenus}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              
              <Link to="/account" className="text-primary/80 hover:text-primary py-2 font-medium flex items-center gap-2" onClick={closeMenus}>
                <UserRound size={20} />
                Личный кабинет
              </Link>
              
              <div className="pt-2 border-t border-gray-100">
                <a href="tel:+78003331111" className="text-primary font-bold block py-2">
                  8 800 333-11-11
                </a>
                <Button 
                  className="bg-primary hover:bg-primary/90 w-full mt-2"
                  onClick={handleCallRequest}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Заказать звонок
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
