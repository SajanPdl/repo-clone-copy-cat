
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StudyMaterials from '@/components/StudyMaterials';

const StudyMaterialPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 w-full">
        <div className="container mx-auto px-4">
          <StudyMaterials />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudyMaterialPage;
