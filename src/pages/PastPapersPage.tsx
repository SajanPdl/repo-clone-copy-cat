
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PastPapers from '@/components/PastPapers';
import SiteMeta from '@/components/SiteMeta';
import { AdsProvider } from '@/components/ads/AdsProvider';

const PastPapersPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-edu-lightgray via-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <SiteMeta 
        title="Past Papers - StudyBuddy"
        description="Access comprehensive collection of past examination papers from various universities and educational institutions."
        keywords="past papers, exam papers, university exams, study materials, Nepal education"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <PastPapers />
        <AdsProvider adType="content" />
      </main>
      <Footer />
    </div>
  );
};

export default PastPapersPage;
