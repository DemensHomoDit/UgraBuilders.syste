import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Services from "./pages/Services";
import ServicesDesign from "./pages/ServicesDesign";
import ServicesConstruction from "./pages/ServicesConstruction";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Contacts from "./pages/Contacts";
import ProjectDetails from "./pages/ProjectDetails";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Reviews from "./pages/Reviews";
import ReviewsFull from "./pages/ReviewsFull";
import ReviewDetails from "./pages/ReviewDetails";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ScrollToTop from "./components/ScrollToTop";
import ProjectsGallery from "./pages/ProjectsGallery";
import ProjectsStandard from "./pages/ProjectsStandard";
import ProjectsCustom from "./pages/ProjectsCustom";
import ProjectsCommercial from "./pages/ProjectsCommercial";
import Account from "./pages/Account";
import Process from "./pages/Process";
import ReviewWrite from "./pages/ReviewWrite";
import OurObjectsPage from "./pages/OurObjectsPage";
import OurObjectDetailPage from "./pages/OurObjectDetailPage";
import { useEffect } from "react";

function App() {
  // Убираем инициализацию административных функций из общего компонента App
  // useEffect(() => {
  //   // Инициализация административных функций при запуске приложения
  //   initAdminFunctions();
  // }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Toaster position="top-center" richColors />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/projects/gallery" element={<Navigate to="/objects" replace />} />
        <Route path="/objects" element={<OurObjectsPage />} />
        <Route path="/objects/:id" element={<OurObjectDetailPage />} />
        <Route path="/projects/standard" element={<ProjectsStandard />} />
        <Route path="/projects/custom" element={<ProjectsCustom />} />
        <Route path="/projects/commercial" element={<ProjectsCommercial />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/design" element={<ServicesDesign />} />
        <Route
          path="/services/construction"
          element={<ServicesConstruction />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/process" element={<Process />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/write" element={<ReviewWrite />} />
        <Route path="/reviews/full" element={<ReviewsFull />} />
        <Route path="/reviews/:id" element={<ReviewDetails />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/account/*" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
