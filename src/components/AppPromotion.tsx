import { Apple, PenTool, BookOpen, Smartphone, Download, Search, User, FileText } from 'lucide-react';

const AppPromotion = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-purple-gradient opacity-5 pointer-events-none"></div>
      <div className="absolute -right-20 top-20 w-64 h-64 bg-edu-orange/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-20 bottom-20 w-64 h-64 bg-edu-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* App info */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              Study Anytime, Anywhere with Our Mobile App
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Download the EduSanskriti mobile app and access all study materials, past papers, and educational resources on the go. Study offline, set reminders, and track your progress.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-edu-purple/10 p-3 rounded-lg">
                  <PenTool className="h-6 w-6 text-edu-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Take Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400">Create and organize notes while studying materials</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-edu-blue/10 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-edu-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Offline Access</h3>
                  <p className="text-gray-600 dark:text-gray-400">Download materials to study without internet access</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-edu-orange/10 p-3 rounded-lg">
                  <Download className="h-6 w-6 text-edu-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Quick Downloads</h3>
                  <p className="text-gray-600 dark:text-gray-400">Fast download of study materials and papers</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-edu-gold/10 p-3 rounded-lg">
                  <Smartphone className="h-6 w-6 text-edu-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mobile Friendly</h3>
                  <p className="text-gray-600 dark:text-gray-400">Optimized interface for all mobile devices</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary inline-flex items-center gap-2">
                <Apple className="h-5 w-5" />
                App Store
              </button>
              
              <button className="btn-secondary inline-flex items-center gap-2">
                <Download className="h-5 w-5" />
                Google Play
              </button>
            </div>
          </div>
          
          {/* App mockup */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-64 md:w-80">
              {/* Phone frame */}
              <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-gray-800 dark:border-gray-900 shadow-2xl">
                {/* Screen content */}
                <div className="aspect-[9/19] bg-white dark:bg-gray-900 overflow-hidden">
                  {/* App screenshot placeholder */}
                  <div className="h-full w-full">
                    {/* App header */}
                    <div className="bg-purple-gradient p-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          <span className="font-semibold">EduSanskriti</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Recent Materials</h4>
                      
                      {/* Material cards */}
                      <div className="space-y-3 mb-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-edu-purple mt-0.5" />
                              <div>
                                <h5 className="text-xs font-medium">Physics Notes {i}</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Mechanics - Chapter {i}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <h4 className="text-sm font-semibold mb-3">Quick Access</h4>
                      
                      {/* Quick access buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {['Study', 'Papers', 'Notes', 'Exams', 'Blog', 'Profile'].map(item => (
                          <div key={item} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-center">
                            <p className="text-xs">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-edu-purple/20 rounded-full blur-xl animate-float"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-edu-orange/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromotion;
