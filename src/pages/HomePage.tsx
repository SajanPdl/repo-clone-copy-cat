
import React from 'react';
import GlobalHeader from '@/components/GlobalHeader';
import Hero from '@/components/Hero';
import StudyMaterials from '@/components/StudyMaterials';
import PastPapers from '@/components/PastPapers';
import GradeSection from '@/components/GradeSection';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import MerchSection from '@/components/MerchSection';
import MarketplaceFeature from '@/components/MarketplaceFeature';
import AppPromotion from '@/components/AppPromotion';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import { useSubscription } from '@/hooks/useSubscription';

const HomePage = () => {
  const { hasActiveSubscription } = useSubscription();

  return (
    <div className="min-h-screen bg-white">
      <GlobalHeader />
      <Hero />
      
      {/* Show upgrade prompt for non-subscribers */}
      {!hasActiveSubscription() && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <UpgradePrompt feature="unlimited access to all study materials" />
        </div>
      )}
      
      <StudyMaterials />
      <PastPapers />
      <GradeSection />
      <MarketplaceFeature />
      <MerchSection />
      <BlogSection />
      <AppPromotion />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default HomePage;
