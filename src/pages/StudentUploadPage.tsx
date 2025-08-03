
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import StudentMaterialUpload from '@/components/student/StudentMaterialUpload';
import { motion } from 'framer-motion';
import { Upload, Sparkles } from 'lucide-react';

const StudentUploadPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-4 px-6 py-4">
                <SidebarTrigger className="lg:hidden" />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Upload Study Material
                    </h1>
                    <p className="text-gray-600 text-sm">Share your knowledge with the community</p>
                  </div>
                </motion.div>
              </div>
            </header>
            <main className="p-0">
              <StudentMaterialUpload />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudentUploadPage;
