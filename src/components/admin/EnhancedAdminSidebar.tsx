
import React, { Dispatch, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  FolderOpen, 
  GraduationCap,
  Calendar,
  ShoppingBag,
  Shirt,
  CreditCard,
  Crown,
  MessageSquare,
  Settings,
  BarChart3,
  Monitor,
  Menu,
  X,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedAdminSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

const EnhancedAdminSidebar: React.FC<EnhancedAdminSidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BookOpen, label: 'Study Materials', path: '/admin/study-materials' },
    { icon: FileText, label: 'Past Papers', path: '/admin/past-papers' },
    { icon: FolderOpen, label: 'Categories', path: '/admin/categories' },
    { icon: GraduationCap, label: 'Grades', path: '/admin/grades' },
    { icon: FileText, label: 'Blog', path: '/admin/blog' },
    { icon: Calendar, label: 'Events', path: '/admin/events' },
    { icon: ShoppingBag, label: 'Marketplace', path: '/admin/marketplace' },
    { icon: Shirt, label: 'Merch Store', path: '/admin/merch' },
    { icon: ClipboardCheck, label: 'Payment Verification', path: '/admin/payment-verification' },
    { icon: Crown, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: Monitor, label: 'Advertisements', path: '/admin/ads' },
    { icon: MessageSquare, label: 'Queries', path: '/admin/queries' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default EnhancedAdminSidebar;
