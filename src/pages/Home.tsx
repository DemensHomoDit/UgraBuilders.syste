import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import ProjectCategories from "@/components/ProjectCategories";
import WhyChooseUs from "@/components/WhyChooseUs";
import ProjectCarousel from "@/components/projects/ProjectCarousel";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroCarousel />
      <ProjectCategories />
      <WhyChooseUs />
      <ProjectCarousel />
      <Footer />
    </main>
  );
};

export default Home;
