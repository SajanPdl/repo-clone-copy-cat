
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Study Materials', href: '/study-materials' },
    { name: 'Past Papers', href: '/past-papers' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold gradient-text">
             MeroAcademy
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-edu-purple dark:hover:text-edu-purple px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="mr-2"
                    >
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="mr-2"
                  >
                    Dashboard
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="max-w-24 truncate">{user.email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        Dashboard
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          Admin Panel
                        </DropdownMenuItem>
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
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-edu-purple p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-edu-purple block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <div className="border-t pt-4 mt-4">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-300 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
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
              ) : (
                <div className="border-t pt-4 mt-4">
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
