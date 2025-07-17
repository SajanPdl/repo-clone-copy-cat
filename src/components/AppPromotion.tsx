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
                  <p className="text-gray-600 dark:text-gray-400">Download materials for offline studying</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-edu-orange/10 p-3 rounded-lg">
                  <Search className="h-6 w-6 text-edu-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
                  <p className="text-gray-600 dark:text-gray-400">Quickly find relevant study materials</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-edu-purple/10 p-3 rounded-lg">
                  <User className="h-6 w-6 text-edu-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-400">Monitor your learning progress and achievements</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                <Apple className="h-6 w-6" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </button>

              <button className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="h-6 w-6 bg-white rounded text-black flex items-center justify-center text-xs font-bold">
                  ▶
                </div>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* App mockup */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative mx-auto w-64 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                {/* Phone screen content */}
                <div className="h-full bg-gradient-to-b from-edu-purple/10 to-edu-blue/10 p-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">EduSanskriti</h3>
                    <p className="text-sm text-gray-600">Mobile App</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                      <FileText className="h-5 w-5 text-edu-purple" />
                      <div>
                        <div className="text-sm font-semibold">Study Materials</div>
                        <div className="text-xs text-gray-500">500+ resources</div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-edu-blue" />
                      <div>
                        <div className="text-sm font-semibold">Past Papers</div>
                        <div className="text-xs text-gray-500">200+ papers</div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                      <PenTool className="h-5 w-5 text-edu-orange" />
                      <div>
                        <div className="text-sm font-semibold">My Notes</div>
                        <div className="text-xs text-gray-500">Personal collection</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl"></div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-edu-purple/20 rounded-full flex items-center justify-center animate-float">
              <Download className="h-8 w-8 text-edu-purple" />
            </div>
            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-edu-blue/20 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
              <Smartphone className="h-8 w-8 text-edu-blue" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromotion;