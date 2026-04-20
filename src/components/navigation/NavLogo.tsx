
import { Link } from "react-router-dom";

interface NavLogoProps {
  closeMenus?: () => void;
}

const NavLogo = ({ closeMenus }: NavLogoProps) => {
  const handleLogoClick = () => {
    if (closeMenus) closeMenus();
    window.scrollTo(0, 0);
  };

  return (
    <Link to="/" className="flex items-center" onClick={handleLogoClick}>
      <div id="logo-placeholder" className="h-11 md:h-12 flex items-center">
        <img
          src="/logo.svg"
          alt="UgraBuilders"
          className="h-full w-auto object-contain"
        />
      </div>
    </Link>
  );
};

export default NavLogo;
