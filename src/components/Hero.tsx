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
        <div className="absolute top-1/3 right-1/4 animate-float opacity-20" style={{animationDelay: '2s'}}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-edu-purple to-edu-blue animate-pulse-slow" />
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float opacity-20" style={{animationDelay: '0.5s'}}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-edu-orange to-edu-gold animate-pulse-slow" />
        </div>
        
        {/* Triangular shape reminiscent of Nepal flag */}
        <div className="absolute top-1/4 right-1/3 animate-float opacity-15" style={{animationDelay: '1.2s'}}>
          <div className="w-24 h-32 bg-gradient-to-b from-[#DC143C] to-[#CC0033]" 
               style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left content - Text and Search */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight animate-fade-in">
              Your Gateway to Educational Excellence
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-in">
              Access comprehensive study materials, past papers, notes, and educational resources to excel in your academic journey.
            </p>
            
            <div className="mb-10 animate-fade-in">
              <SearchBar className="max-w-2xl mx-auto lg:mx-0" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in">
              <Button asChild className="btn-primary group">
                <Link to="/study-materials" className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 group-hover:animate-bounce-subtle" />
                  Explore Resources
                </Link>
              </Button>
              <Button asChild className="btn-secondary group">
                <Link to="#app-promotion" className="flex items-center">
                  <Download className="mr-2 h-5 w-5 group-hover:animate-bounce-subtle" />
                  Download App
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right content - Mobile App Preview */}
          <div className="lg:w-1/2 mt-10 lg:mt-0 animate-fade-in">
            <div className="relative mx-auto" style={{ maxWidth: '380px' }}>
              {/* Phone frame */}
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                {/* Phone top notch */}
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                
                {/* Phone screen */}
                <div className="h-[572px] w-[272px] bg-white dark:bg-gray-900 overflow-hidden">
                  {/* App UI - updated with Nepal-themed colors */}
                  <div className="flex flex-col h-full">
                    {/* App header - updated to Nepal flag colors */}
                    <div className="bg-gradient-to-r from-[#DC143C] to-[#003893] p-4 text-white">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">EduSanskriti</h3>
                        <div className="flex space-x-2">
                          <Search className="h-5 w-5" />
                          <Bell className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="flex-1 overflow-auto">
                      {/* Featured banner */}
                      <div className="bg-gradient-to-r from-[#DC143C] to-[#003893] m-3 rounded-xl p-4 text-white">
                        <h4 className="font-bold mb-1">New Update Available!</h4>
                        <p className="text-xs mb-2">Download our latest version with new features.</p>
                        <button className="bg-white text-[#003893] text-xs px-3 py-1 rounded-full font-medium">
                          Update Now
                        </button>
                      </div>
                      
                      {/* Categories */}
                      <div className="p-3">
                        <h4 className="font-bold text-sm mb-2">Categories</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {['Notes', 'Papers', 'Quizzes', 'Books'].map((cat, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 ${
                                index % 4 === 0 ? 'bg-[#DC143C]/10 text-[#DC143C]' :
                                index % 4 === 1 ? 'bg-[#003893]/10 text-[#003893]' :
                                index % 4 === 2 ? 'bg-orange-100 text-edu-orange' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {index % 4 === 0 && <BookOpen className="h-5 w-5" />}
                                {index % 4 === 1 && <FileText className="h-5 w-5" />}
                                {index % 4 === 2 && <Clipboard className="h-5 w-5" />}
                                {index % 4 === 3 && <Book className="h-5 w-5" />}
                              </div>
                              <span className="text-xs">{cat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Popular materials */}
                      <div className="p-3">
                        <h4 className="font-bold text-sm mb-2">Popular Materials</h4>
                        <div className="space-y-2">
                          {[
                            'Mathematics for Grade 10', 
                            'Physics Notes - Mechanics', 
                            'Chemistry Formulas Handbook'
                          ].map((title, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex gap-2">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                  index % 3 === 0 ? 'bg-[#DC143C]/10 text-[#DC143C]' :
                                  index % 3 === 1 ? 'bg-[#003893]/10 text-[#003893]' :
                                  'bg-orange-100 text-edu-orange'
                                }`}>
                                  {index % 3 === 0 && <FileText className="h-5 w-5" />}
                                  {index % 3 === 1 && <BookOpen className="h-5 w-5" />}
                                  {index % 3 === 2 && <Beaker className="h-5 w-5" />}
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium">{title}</h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                      4.8 ★
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                      {Math.floor(Math.random() * 1000) + 500} downloads
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Recent Materials */}
                      <div className="p-3">
                        <h4 className="font-bold text-sm mb-2">Recent Materials</h4>
                        <div className="overflow-x-auto">
                          <div className="flex gap-3 w-max pb-2">
                            {['English Grammar', 'Computer Science', 'Biology Notes'].map((title, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-36 shrink-0 shadow-sm">
                                <div className={`h-20 rounded-lg mb-2 ${
                                  index % 3 === 0 ? 'bg-[#DC143C]/10' :
                                  index % 3 === 1 ? 'bg-[#003893]/10' :
                                  'bg-orange-100'
                                } flex items-center justify-center`}>
                                  {index % 3 === 0 && <BookOpen className={`h-8 w-8 ${
                                    index % 3 === 0 ? 'text-[#DC143C]' :
                                    index % 3 === 1 ? 'text-[#003893]' :
                                    'text-edu-orange'
                                  }`} />}
                                  {index % 3 === 1 && <Laptop className={`h-8 w-8 ${
                                    index % 3 === 0 ? 'text-[#DC143C]' :
                                    index % 3 === 1 ? 'text-[#003893]' :
                                    'text-edu-orange'
                                  }`} />}
                                  {index % 3 === 2 && <Microscope className={`h-8 w-8 ${
                                    index % 3 === 0 ? 'text-[#DC143C]' :
                                    index % 3 === 1 ? 'text-[#003893]' :
                                    'text-edu-orange'
                                  }`} />}
                                </div>
                                <h5 className="text-sm font-medium truncate">{title}</h5>
                                <p className="text-xs text-gray-500 mt-1">Added today</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App navigation */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900">
                      <div className="flex justify-around">
                        {['Home', 'Search', 'Saved', 'Profile'].map((item, index) => (
                          <div key={index} className={`flex flex-col items-center p-1 ${index === 0 ? 'text-[#DC143C]' : 'text-gray-500'}`}>
                            {index === 0 && <Home className="h-5 w-5" />}
                            {index === 1 && <Search className="h-5 w-5" />}
                            {index === 2 && <Bookmark className="h-5 w-5" />}
                            {index === 3 && <User className="h-5 w-5" />}
                            <span className="text-[10px] mt-1">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Device shine effect */}
              <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none overflow-hidden">
                <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer opacity-40"></div>
              </div>
              
              {/* Download badge - updated with Nepal flag colors */}
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-[#DC143C] to-[#003893] text-white px-4 py-2 rounded-full shadow-lg animate-bounce-subtle">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Download className="h-4 w-4" />
                  Get the App
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats/featured numbers */}
      <div className="container mx-auto px-4 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="glass-card interactive-card p-6 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-[#DC143C] mb-2">10K+</h3>
            <p className="text-gray-600 dark:text-gray-400">Study Materials</p>
          </div>
          
          <div className="glass-card interactive-card p-6 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-[#003893] mb-2">5K+</h3>
            <p className="text-gray-600 dark:text-gray-400">Past Papers</p>
          </div>
          
          <div className="glass-card interactive-card p-6 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-edu-orange mb-2">100+</h3>
            <p className="text-gray-600 dark:text-gray-400">Subjects</p>
          </div>
          
          <div className="glass-card interactive-card p-6 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-edu-gold mb-2">50K+</h3>
            <p className="text-gray-600 dark:text-gray-400">Students</p>
          </div>
        </div>
      </div>
      
      {/* Show Nepal-themed floating ad */}
      <NepalAdsFloater />
    </section>
  );
};

export default Hero;
