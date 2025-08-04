
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import StudyMaterials from '@/components/StudyMaterials';
import PastPapers from '@/components/PastPapers';
import GradeSection from '@/components/GradeSection';
import ContactSection from '@/components/ContactSection';
import MarketplaceFeature from '@/components/MarketplaceFeature';
import BlogSection from '@/components/BlogSection';
import AppPromotion from '@/components/AppPromotion';

const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        <Hero />
        <StudyMaterials />
        <PastPapers />
        <GradeSection />
        <MarketplaceFeature />
        <BlogSection />
        <AppPromotion />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
