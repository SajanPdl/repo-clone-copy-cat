
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const AdminHeader = () => {
  const { toast } = useToast();
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out of the admin panel.",
    });
  };
  
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications.",
    });
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-6 shadow-sm">
      <div className="flex items-center justify-end">
        <div className="relative md:w-64 mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="Search..." 
            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-full"
          />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative mr-2"
          onClick={handleNotificationClick}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:inline">Admin User</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
