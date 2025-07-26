
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GradeSection from "@/components/GradeSection";
import StudyMaterials from "@/components/StudyMaterials";
import PastPapers from "@/components/PastPapers";
import BlogSection from "@/components/BlogSection";
import AppPromotion from "@/components/AppPromotion";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AdPlacement from "@/components/ads/AdPlacement";
import AnimatedWrapper from "@/components/ui/animated-wrapper";

const Index = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <motion.div 
      className="min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />
      
      {/* Header Ad Placement */}
      <AdPlacement position="header" className="sticky top-0 z-40" />
      
      {/* Fixed Sidebar Ad Placement */}
      <AdPlacement position="sidebar" />
      
      <motion.main 
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Hero />
      </motion.main>

      {/* Main Content */}
      <div className="w-full">
        <AnimatedWrapper animation="slideUp" delay={0.2}>
          <GradeSection />
        </AnimatedWrapper>
        
        {/* Content Ad Placement */}
        <AdPlacement position="content" className="my-8" />
        
        <AnimatedWrapper animation="slideUp" delay={0.4}>
          <StudyMaterials />
        </AnimatedWrapper>
        
        <AnimatedWrapper animation="slideUp" delay={0.6}>
          <PastPapers />
        </AnimatedWrapper>
        
        <AnimatedWrapper animation="slideUp" delay={0.8}>
          <BlogSection />
        </AnimatedWrapper>
        
        <AnimatedWrapper animation="slideUp" delay={1.0}>
          <AppPromotion />
        </AnimatedWrapper>
        
        <AnimatedWrapper animation="slideUp" delay={1.2}>
          <ContactSection />
        </AnimatedWrapper>
      </div>

      {/* Footer Ad Placement */}
      <AdPlacement position="footer" className="mb-4" />
      
      <motion.footer 
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Footer />
      </motion.footer>
    </motion.div>
  );
};

export default Index;
