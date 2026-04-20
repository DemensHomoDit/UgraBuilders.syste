
import { useState, useEffect } from "react";
import NavLogo from "./navigation/NavLogo";
import DesktopNav from "./navigation/DesktopNav";
import MobileNav from "./navigation/MobileNav";
import { Phone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProjectsMenuOpen(false);
  };

  const handleOrderCall = () => {
    navigate("/contacts");
    closeMenus();
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}>
        <div className="container mx-auto px-4">
          {/* Top row with logo, phone, and account */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <NavLogo closeMenus={closeMenus} />
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/account" 
                className="flex items-center gap-2 text-primary/80 hover:text-primary transition-colors font-medium"
                onClick={closeMenus}
              >
                <UserRound size={18} className="flex-shrink-0" />
                <span className="whitespace-nowrap">Личный кабинет</span>
              </Link>
              <div className="hidden xl:block">
                <a href="tel:+78003331111" className="text-primary font-bold text-lg hover:text-primary/80 transition-colors whitespace-nowrap">
                  8 800 333-11-11
                </a>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 whitespace-nowrap text-sm px-3 md:px-4 py-1 h-auto"
                onClick={handleOrderCall}
              >
                <Phone className="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-2 flex-shrink-0" />
                Заказать звонок
              </Button>
            </div>
            
            {/* Mobile menu toggle button */}
            <div className="flex md:hidden">
              <MobileNav 
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                isProjectsMenuOpen={isProjectsMenuOpen}
                setIsProjectsMenuOpen={setIsProjectsMenuOpen}
                closeMenus={closeMenus}
              />
            </div>
          </div>
          
          {/* Bottom row with navigation menu (desktop only) */}
          <div className="hidden md:flex justify-center py-3">
            <DesktopNav 
              isProjectsMenuOpen={isProjectsMenuOpen}
              setIsProjectsMenuOpen={setIsProjectsMenuOpen}
              closeMenus={closeMenus}
            />
          </div>
        </div>
      </nav>
      
      {/* Spacer div to prevent content from being hidden behind the navbar */}
      <div className="h-[120px] md:h-[140px]"></div>
    </>
  );
};

export default Navbar;
