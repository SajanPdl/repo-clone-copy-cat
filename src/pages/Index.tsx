
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StudyMaterials from "@/components/StudyMaterials";
import PastPapers from "@/components/PastPapers";
import BlogSection from "@/components/BlogSection";
import MarketplaceFeature from "@/components/MarketplaceFeature";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AppPromotion from "@/components/AppPromotion";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <StudyMaterials />
      <PastPapers />
      <MarketplaceFeature />
      <BlogSection />
      <ContactSection />
      <AppPromotion />
      <Footer />
    </div>
  );
};

export default Index;
