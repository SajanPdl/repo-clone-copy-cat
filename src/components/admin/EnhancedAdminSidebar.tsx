
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  ShoppingCart,
  Calendar,
  MessageSquare,
  Award,
  CreditCard,
  Crown,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const EnhancedAdminSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Study Materials', path: '/admin/study-materials', icon: BookOpen },
    { name: 'Past Papers', path: '/admin/past-papers', icon: FileText },
    { name: 'Categories', path: '/admin/categories', icon: Settings },
    { name: 'Grades', path: '/admin/grades', icon: Award },
    { name: 'Blog Posts', path: '/admin/blog', icon: MessageSquare },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Marketplace', path: '/admin/marketplace', icon: ShoppingCart },
    { name: 'Merch Store', path: '/admin/merch', icon: ShoppingCart },
    { name: 'Payment Verification', path: '/admin/payment-verification', icon: CheckCircle },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: Crown },
    { name: 'Advertisements', path: '/admin/ads', icon: CreditCard },
    { name: 'Queries', path: '/admin/queries', icon: MessageSquare },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MA</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">MeroAcademy</h2>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default EnhancedAdminSidebar;
