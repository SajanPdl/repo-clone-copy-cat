import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, GraduationCap, Download, Search, Phone, Laptop, Clipboard, Book, Beaker, Home, Bookmark, User, Bell, MessageSquare, Microscope, Mountain, Trees, Flag } from 'lucide-react';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { NepalAdsFloater } from './ads/NepalAdsFloater';

const Hero = () => {


  return (
    <section className="relative pt-24 pb-40 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-pattern animate-bg-shift opacity-30"></div>

      {/* Floating icons decoration - with Nepali theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Educational icons */}
        <div className="absolute top-1/4 left-1/5 animate-float opacity-20">
          <BookOpen size={72} className="text-edu-purple" />
        </div>
        <div className="absolute top-2/3 left-3/4 animate-float opacity-20" style={{animationDelay: '1s'}}>
          <FileText size={48} className="text-edu-blue" />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float opacity-20" style={{animationDelay: '1.5s'}}>
          <GraduationCap size={64} className="text-edu-orange" />
        </div>

        {/* Nepal-themed elements */}
        <div className="absolute top-1/6 right-1/6 animate-float opacity-30" style={{animationDelay: '0.8s'}}>
          <Mountain size={80} className="text-edu-blue" />
        </div>
        <div className="absolute top-2/3 right-1/5 animate-float opacity-25" style={{animationDelay: '2.2s'}}>
          <Trees size={60} className="text-edu-purple" />
        </div>
        <div className="absolute bottom-1/6 left-1/6 animate-float opacity-30" style={{animationDelay: '1.8s'}}>
          <Flag size={72} className="text-[#DC143C]" /> {/* Nepal flag color */}
        </div>

        {/* Decorative gradient circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-edu-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-edu-purple/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-edu-orange/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-edu-purple via-edu-blue to-edu-orange">
              Your Gateway to
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              Educational Excellence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Access comprehensive study materials, past papers, notes, and educational resources for grades 10-12 and bachelor's level. 
            Learn from the comfort of your home with our curated content.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="btn-gradient text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Study Materials
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-edu-purple dark:hover:border-edu-purple transition-all duration-300"
            >
              <FileText className="mr-2 h-5 w-5" />
              Browse Past Papers
            </Button>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <SearchBar />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-edu-purple mb-2">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Study Materials</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-edu-blue mb-2">200+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Past Papers</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-edu-orange mb-2">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subjects</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-edu-purple mb-2">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Students Helped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nepal Ads Floater */}
      <NepalAdsFloater />
    </section>
  );
};

export default Hero;