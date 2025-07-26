
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Megaphone, 
  GraduationCap,
  FolderPlus,
  BookOpen,
  ClipboardList,
  Users,
  Settings,
  MapPin,
  ShoppingCart
} from 'lucide-react';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import PastPapersManager from '@/components/admin/PastPapersManager';
import QueriesManager from '@/components/admin/QueriesManager';
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import BlogEditor from '@/components/admin/BlogEditor';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import GradesManager from '@/components/admin/GradesManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import AdPlacementManager from '@/components/admin/AdPlacementManager';
import MarketplaceManager from '@/components/admin/MarketplaceManager';
import AnimatedWrapper from '@/components/ui/animated-wrapper';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
    { id: 'materials', label: 'Study Materials', icon: BookOpen, color: 'from-green-500 to-green-600' },
    { id: 'pastpapers', label: 'Past Papers', icon: ClipboardList, color: 'from-purple-500 to-purple-600' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600' },
    { id: 'queries', label: 'User Queries', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
    { id: 'ads', label: 'Advertisements', icon: Megaphone, color: 'from-red-500 to-red-600' },
    { id: 'ad-placements', label: 'Ad Placements', icon: MapPin, color: 'from-pink-500 to-pink-600' },
    { id: 'blogs', label: 'Blog Management', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
    { id: 'categories', label: 'Categories', icon: FolderPlus, color: 'from-teal-500 to-teal-600' },
    { id: 'grades', label: 'Grades', icon: GraduationCap, color: 'from-yellow-500 to-yellow-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-cyan-500 to-cyan-600' }
  ];

  const renderContent = () => {
    const contentComponents = {
      dashboard: () => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold mb-2"
            >
              Admin Dashboard
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-300"
            >
              Welcome to the admin panel. Select a section from the sidebar to manage different aspects of the platform.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {menuItems.slice(1).map((item, index) => (
              <AnimatedWrapper
                key={item.id}
                animation="slideUp"
                delay={index * 0.1}
                hover
              >
                <Card 
                  className="cursor-pointer border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  onClick={() => setActiveTab(item.id)}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <motion.div 
                      className={`p-3 bg-gradient-to-r ${item.color} rounded-lg mr-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-lg font-medium">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage and configure {item.label.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedWrapper>
            ))}
          </motion.div>
        </motion.div>
      ),
      materials: () => <StudyMaterialsManager />,
      pastpapers: () => <PastPapersManager />,
      marketplace: () => <MarketplaceManager />,
      queries: () => <QueriesManager />,
      ads: () => <AdvertisementManager />,
      'ad-placements': () => <AdPlacementManager />,
      blogs: () => <BlogEditor />,
      categories: () => <CategoriesManager />,
      analytics: () => <AnalyticsPage />,
      grades: () => <GradesManager />
    };

    return contentComponents[activeTab]?.() || <div>Select a section from the sidebar</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
