
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StudyMaterials from '@/components/StudyMaterials';
import PastPapers from '@/components/PastPapers';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import AppPromotion from '@/components/AppPromotion';
import MarketplaceFeature from '@/components/MarketplaceFeature';
import NotificationSystem from '@/components/NotificationSystem';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NotificationSystem />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Study Materials Section */}
      <StudyMaterials />

      {/* Past Papers Section */}
      <PastPapers />

      {/* Marketplace Feature */}
      <MarketplaceFeature />

      {/* Blog Section */}
      <BlogSection />

      {/* Contact Section */}
      <ContactSection />

      {/* App Promotion */}
      <AppPromotion />

      {/* Footer */}
      <Footer />

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default Index;
