
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-edu-purple via-edu-indigo to-edu-blue text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Your Gateway to
                <span className="block text-edu-gold">Academic Excellence</span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0">
                Access premium study materials, past papers, and connect with Nepal's brightest students. 
                Your success story starts here.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/study-materials">
                <Button size="lg" className="w-full sm:w-auto bg-edu-gold hover:bg-edu-orange text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:shadow-neon-orange hover:-translate-y-1">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-edu-purple font-semibold px-8 py-3 rounded-full transition-all duration-300">
                  Join Now - Free
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 lg:pt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-edu-gold">1000+</div>
                <div className="text-sm sm:text-base text-blue-200">Study Materials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-edu-gold">500+</div>
                <div className="text-sm sm:text-base text-blue-200">Past Papers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-edu-gold">5000+</div>
                <div className="text-sm sm:text-base text-blue-200">Students</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative order-first lg:order-last">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Floating Cards */}
              <div className="relative z-10 space-y-4">
                <div className="glass-card p-4 sm:p-6 animate-float" style={{animationDelay: '0s'}}>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-edu-gold/20 rounded-lg">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-edu-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Premium Study Materials</h3>
                      <p className="text-xs sm:text-sm text-blue-200">High-quality notes & resources</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-6 animate-float ml-auto max-w-xs sm:max-w-sm" style={{animationDelay: '1s'}}>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-edu-orange/20 rounded-lg">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-edu-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Study Community</h3>
                      <p className="text-xs sm:text-sm text-blue-200">Connect with peers</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-6 animate-float" style={{animationDelay: '2s'}}>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-green-400/20 rounded-lg">
                      <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Achievement System</h3>
                      <p className="text-xs sm:text-sm text-blue-200">Earn rewards for learning</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-edu-gold/20 rounded-full blur-xl animate-pulse-slow"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 sm:w-32 sm:h-32 bg-edu-orange/20 rounded-full blur-xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
