
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProjectErrorState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Проект не найден</h2>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Вернуться назад
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ProjectErrorState;
