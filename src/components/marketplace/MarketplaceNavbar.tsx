
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  User, 
  Bell, 
  Heart,
  MessageSquare,
  Menu,
  Home,
  BookOpen,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MarketplaceNavbarProps {
  onCreateListing?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  cartItemCount?: number;
  notificationCount?: number;
}

const MarketplaceNavbar = ({ 
  onCreateListing, 
  searchValue = '', 
  onSearchChange,
  cartItemCount = 0,
  notificationCount = 0 
}: MarketplaceNavbarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Study Materials', icon: BookOpen, path: '/study-materials' },
    { name: 'Past Papers', icon: FileText, path: '/past-papers' },
    { name: 'Marketplace', icon: ShoppingCart, path: '/marketplace', active: true },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduSanskriti Marketplace
              </span>
            </Link>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.active
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search books, notes, supplies..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Create Listing Button */}
            {user && (
              <Button
                onClick={onCreateListing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Listing</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}

            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>

                {/* Favorites */}
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>

                {/* Messages */}
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>

                {/* Cart */}
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center p-0">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </Badge>
                  )}
                </Button>

                {/* Profile Menu */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className="relative"
                >
                  <User className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Join Now
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu (hidden by default, can be toggled) */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="px-2 py-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors",
                item.active
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MarketplaceNavbar;
