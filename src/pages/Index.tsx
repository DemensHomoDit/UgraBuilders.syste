import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import ProjectCategories from "@/components/ProjectCategories";
import ProjectCarousel from "@/components/projects/ProjectCarousel";
import Footer from "@/components/Footer";

const Index = () => {
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

export default Index;
