
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Users, Award } from 'lucide-react';
import SearchBar from './SearchBar';
import { AdsProvider } from '@/components/ads/AdsProvider';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-edu-lightgray via-white to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Unlock Your</span>
            <br />
            <span className="text-gray-800 dark:text-white">Academic Potential</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Access comprehensive study materials, past papers, and connect with fellow students. 
            Your journey to academic excellence starts here.
          </p>
          
          <div className="mb-12">
            <SearchBar />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button size="lg" className="btn-primary">
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Materials
            </Button>
            <Button size="lg" variant="outline" className="border-2">
              <Users className="w-5 h-5 mr-2" />
              Join Community
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-edu-primary mb-2">1000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Study Materials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-edu-primary mb-2">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Past Papers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-edu-primary mb-2">2000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-edu-primary mb-2">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Universities</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ad Placement */}
      <AdsProvider adType="hero" />
    </section>
  );
};

export default Hero;
