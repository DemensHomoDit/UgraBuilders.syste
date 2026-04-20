
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProjectLoadingState: React.FC = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36 flex items-center justify-center">
        <p className="text-primary text-lg">Загрузка проекта...</p>
      </div>
      <Footer />
    </main>
  );
};

export default ProjectLoadingState;
