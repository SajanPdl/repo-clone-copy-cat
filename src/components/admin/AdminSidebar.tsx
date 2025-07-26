
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed 
}) => {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
    { id: 'users', label: 'User Management', icon: Users, color: 'from-cyan-500 to-cyan-600', route: '/admin/users' },
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

  const handleItemClick = (item: any) => {
    if (item.route) {
      // For items with routes, don't set active tab since they navigate away
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <motion.div 
      initial={{ width: collapsed ? 80 : 256 }}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </span>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = item.route ? location.pathname === item.route : activeTab === item.id;
            
            const ItemComponent = item.route ? Link : 'button';
            const itemProps = item.route 
              ? { to: item.route } 
              : { onClick: () => handleItemClick(item) };

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ItemComponent
                  {...itemProps}
                  className={cn(
                    "w-full flex items-center rounded-lg p-3 text-left transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                    isActive && "bg-gradient-to-r text-white shadow-md",
                    isActive && item.color,
                    !isActive && "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        collapsed && "h-6 w-6"
                      )} />
                    </motion.div>
                    
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </div>
                </ItemComponent>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Settings</span>}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
