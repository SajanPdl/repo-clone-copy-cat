
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GradeSection from "@/components/GradeSection";
import StudyMaterials from "@/components/StudyMaterials";
import PastPapers from "@/components/PastPapers";
import BlogSection from "@/components/BlogSection";
import AppPromotion from "@/components/AppPromotion";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <GradeSection />
      <StudyMaterials />
      <PastPapers />
      <BlogSection />
      <AppPromotion />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
