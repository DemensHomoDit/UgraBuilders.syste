
import { Button } from "@/components/ui/button";
import { Mail, Phone, Instagram } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  
  const handleCallRequest = () => {
    navigate('/contacts');
  };
  
  return (
    <footer className="bg-primary text-white pt-12 md:pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 md:mb-12">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-4">UgraBuilders</h3>
            <div className="flex justify-center md:justify-start space-x-3 md:space-x-4 mb-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-white/10 p-1.5 md:p-2 rounded-full hover:bg-white/20 transition-colors">
                <Instagram size={16} className="md:w-5 md:h-5" />
              </a>
              <a href="https://vk.com/ugrabuilders" target="_blank" rel="noopener noreferrer" aria-label="VK" className="bg-white/10 p-1.5 md:p-2 rounded-full hover:bg-white/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="md:w-5 md:h-5">
                  <path d="M4.447 3C3.09 3 1.6 3.497 1.6 5.177v13.646C1.6 20.503 3.089 21 4.447 21h15.106c1.358 0 2.847-.497 2.847-2.177V5.177C22.4 3.497 20.911 3 19.553 3H4.447zm12.009 13.273h-1.778c-.356 0-.616-.29-.83-.635-.236-.383-.46-.774-.684-1.163-.236-.414-.517-.612-.916-.612-.676 0-.901.282-.901 1.003v2.023c0 .682-.129.791-.781.791H9.58c-.713 0-.836-.289-.836-1.003V8.213c0-.627.237-.84.8-.84h1.776c.594 0 .799.23.799.841V10.2c0 .756.111.861.705.861h.532c.651 0 .799-.127.997-.49.27-.512.508-1.036.775-1.543.216-.403.495-.567.917-.567h1.776c.611 0 .757.309.594.806-.184.557-.531 1.206-1.098 2.133-.753 1.203-.754 1.01-.092 2.205.457.835.963 1.623 1.413 2.46.28.535.154.967-.49.967z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="text-left-align">
            <h3 className="text-lg md:text-xl font-bold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-1 text-accent md:w-[18px] md:h-[18px]" />
                <div>
                  <a href="tel:+78003331111" className="font-medium text-sm md:text-base block hover:text-accent transition-colors">8 800 333-11-11</a>
                  <p className="text-xs md:text-sm text-white/60">Бесплатно по России</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-1 text-accent md:w-[18px] md:h-[18px]" />
                <div>
                  <a href="mailto:info@ugrabuilders.ru" className="font-medium text-sm md:text-base block hover:text-accent transition-colors">info@ugrabuilders.ru</a>
                  <p className="text-xs md:text-sm text-white/60">Для запросов</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div className="sm:col-span-2 lg:col-span-1 text-left-align">
            <h3 className="text-lg md:text-xl font-bold mb-4">Информация</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-y-2 gap-x-4 text-sm md:text-base">
              <li>
                <Link to="/projects/standard" className="text-white/80 hover:text-white transition-colors">Серийные проекты</Link>
              </li>
              <li>
                <Link to="/projects/custom" className="text-white/80 hover:text-white transition-colors">Индивидуальные проекты</Link>
              </li>
              <li>
                <Link to="/projects/commercial" className="text-white/80 hover:text-white transition-colors">Коммерческие проекты</Link>
              </li>
              <li>
                <Link to="/services" className="text-white/80 hover:text-white transition-colors">Наши услуги</Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors">О компании</Link>
              </li>
              <li>
                <Link to="/process" className="text-white/80 hover:text-white transition-colors">Этапы работы</Link>
              </li>
              <li>
                <Link to="/reviews" className="text-white/80 hover:text-white transition-colors">Отзывы клиентов</Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/80 hover:text-white transition-colors">Блог</Link>
              </li>
              <li>
                <Link to="/contacts" className="text-white/80 hover:text-white transition-colors">Контакты</Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="text-left-align">
            <h3 className="text-lg md:text-xl font-bold mb-4">Остались вопросы?</h3>
            <p className="text-white/80 mb-4 text-sm md:text-base">
              Оставьте заявку и мы перезвоним вам в ближайшее время
            </p>
            <Button 
              className="w-full bg-white text-primary hover:bg-white/90 text-xs md:text-sm py-2 md:py-4 h-10 md:h-12"
              onClick={handleCallRequest}
            >
              <Phone className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Заказать звонок
            </Button>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-xs md:text-sm text-center md:text-left">
              © {currentYear} UgraBuilders. Все права защищены.
            </p>
            <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-white/60 justify-center">
              <Link to="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link>
              <span className="hidden md:inline">|</span>
              <Link to="/terms" className="hover:text-white transition-colors">Условия использования</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
