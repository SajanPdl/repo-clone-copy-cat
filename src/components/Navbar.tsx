
import React, { useState } from 'react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ShoppingCart, Calendar, Brain, Gift, Upload, PlusCircle, Bell, Heart, MessageSquare, Search, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Navbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSiteSettings();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Study Materials', href: '/study-materials' },
    { name: 'Past Papers', href: '/past-papers' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Events', href: '/events' },
    { name: 'Contact', href: '/contact' },
  ];

  const studentFeatures = [
    { name: 'Upload Material', href: '/upload-material', icon: Upload },
    { name: 'Daily Planner', href: '/planner', icon: Calendar },
    { name: 'Study Assistant', href: '/study-assistant', icon: Brain },
    { name: 'Referral Program', href: '/referral', icon: Gift },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-cover rounded" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ES</span>
                </div>
              )}
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {settings.site_name || 'MeroAcademy'}
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search materials, papers, marketplace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Student Features */}
                <div className="hidden lg:flex items-center space-x-2">
                  {studentFeatures.slice(0, 3).map((feature) => (
                    <Button
                      key={feature.name}
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(feature.href)}
                      className="flex items-center space-x-1"
                    >
                      <feature.icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{feature.name}</span>
                    </Button>
                  ))}
                </div>

                {/* Marketplace Actions */}
                <Button
                  onClick={() => navigate('/marketplace')}
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center p-0">
                    0
                  </Badge>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                    0
                  </Badge>
                </Button>

                {/* Create Listing Button */}
                <Button
                  onClick={() => navigate('/marketplace')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hidden md:flex"
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create
                </Button>

                {/* Admin Panel Button */}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="hidden lg:flex"
                  >
                    Admin Panel
                  </Button>
                )}

                {/* Profile Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span className="max-w-24 truncate hidden sm:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/referral')}>
                      <Gift className="mr-2 h-4 w-4" />
                      Referral Program
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {studentFeatures.map((feature) => (
                      <DropdownMenuItem key={feature.name} onClick={() => navigate(feature.href)}>
                        <feature.icon className="mr-2 h-4 w-4" />
                        {feature.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Join Now
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Search */}
              <div className="mb-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10"
                    />
                  </div>
                </form>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {user && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <div className="px-3 py-2">
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    
                    {studentFeatures.map((feature) => (
                      <Link
                        key={feature.name}
                        to={feature.href}
                        className="text-gray-700 dark:text-gray-300 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <feature.icon className="h-5 w-5" />
                        <span>{feature.name}</span>
                      </Link>
                    ))}

                    <Link
                      to="/profile"
                      className="text-gray-700 dark:text-gray-300 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-gray-700 dark:text-gray-300 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                  >
                    Join Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
