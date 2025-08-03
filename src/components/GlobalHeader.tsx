
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NotificationSystem from './NotificationSystem';

const GlobalHeader = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              EduHub Nepal
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/study-materials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Study Materials
            </Link>
            <Link to="/past-papers" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Past Papers
            </Link>
            <Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Blog
            </Link>
            <Link to="/marketplace" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Marketplace
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <NotificationSystem />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/login')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
