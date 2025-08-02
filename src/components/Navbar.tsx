
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Search, Calendar, Briefcase, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/study-materials?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Study Materials', href: '/study-materials' },
    { name: 'Past Papers', href: '/past-papers' },
    { 
      name: 'Marketplace', 
      href: '/marketplace',
      icon: ShoppingBag,
      description: 'Buy & Sell Books'
    },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-lg dark:bg-gray-900/95 shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MeroAcademy
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search study materials, notes, books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 transition-colors"
              />
            </form>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {/* Quick Access Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/events')}
                className="hidden lg:flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Events
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/jobs')}
                className="hidden lg:flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Jobs
              </Button>

              {user ? (
                <div className="flex items-center space-x-2">
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
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Dashboard
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="max-w-24 truncate">{user.email?.split('@')[0]}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/upload')}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Upload Content
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            Admin Panel
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 p-2 rounded-lg"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-full bg-gray-50 dark:bg-gray-800"
            />
          </form>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-3 rounded-lg text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <div>
                    <div>{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}

              {/* Quick Access for Mobile */}
              <Link
                to="/events"
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-3 rounded-lg text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <div>
                  <div>Events</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Exams & Webinars</div>
                </div>
              </Link>

              <Link
                to="/jobs"
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-3 rounded-lg text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Briefcase className="h-5 w-5" />
                <div>
                  <div>Job Listings</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Internships & Jobs</div>
                </div>
              </Link>

              {user ? (
                <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-300 block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/upload"
                    className="text-gray-700 dark:text-gray-300 block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Upload Content
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-gray-700 dark:text-gray-300 block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    className="text-red-600 block px-3 py-2 rounded-lg text-base font-medium w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700 space-y-2">
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Get Started
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
