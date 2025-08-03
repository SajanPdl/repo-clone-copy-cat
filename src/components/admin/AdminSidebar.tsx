
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  BookText, 
  FileText, 
  Users, 
  Bell, 
  Settings,
  Tag,
  GraduationCap,
  ChevronRight,
  User,
  LogOut,
  BarChart2,
  MessageSquare,
  Clock,
  ChevronLeft,
  ShoppingCart,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getNepaliDate, getNepaliTime } from '@/utils/nepaliDate';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const AdminSidebar = ({ collapsed = false, setCollapsed }: AdminSidebarProps) => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  const sidebarItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      id: 'dashboard',
      path: '/admin'
    },
    {
      name: 'Study Materials',
      icon: BookText,
      id: 'materials',
      path: '/admin/materials'
    },
    {
      name: 'Past Papers',
      icon: FileText,
      id: 'papers',
      path: '/admin/papers'
    },
    {
      name: 'Marketplace',
      icon: ShoppingCart,
      id: 'marketplace',
      path: '/admin/marketplace'
    },
    {
      name: 'Categories',
      icon: Tag,
      id: 'categories',
      path: '/admin/categories'
    },
    {
      name: 'Grades',
      icon: GraduationCap,
      id: 'grades',
      path: '/admin/grades'
    },
    {
      name: 'Users',
      icon: Users,
      id: 'users',
      path: '/admin/users'
    },
    {
      name: 'Queries',
      icon: MessageSquare,
      id: 'queries',
      path: '/admin/queries'
    },
    {
      name: 'Advertisement',
      icon: Bell,
      id: 'ads',
      path: '/admin/ads'
    },
    {
      name: 'Ad Placements',
      icon: MapPin,
      id: 'ad-placements',
      path: '/admin/ad-placements'
    },
    {
      name: 'Analytics',
      icon: BarChart2,
      id: 'analytics',
      path: '/admin/analytics'
    },
    {
      name: 'Settings',
      icon: Settings,
      id: 'settings',
      path: '/admin/settings'
    }
  ];
  
  useEffect(() => {
    const updateDateTime = () => {
      setCurrentTime(getNepaliTime());
      setCurrentDate(getNepaliDate());
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out of the admin panel.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleSidebar = () => {
    if (setCollapsed) {
      setCollapsed(!collapsed);
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <aside className="h-full w-full bg-indigo-900 text-white flex flex-col">
      <div className={cn(
        "p-6 border-b border-indigo-800 flex justify-between items-center",
        collapsed && "px-4 py-6 justify-center"
      )}>
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold">EduSanskriti</h2>
            <p className="text-indigo-300 text-sm">Admin Dashboard</p>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <h2 className="text-2xl font-bold">ES</h2>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-indigo-300 hover:text-white hover:bg-indigo-800"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Nepali Date & Time Display */}
      {!collapsed && (
        <div className="p-4 border-b border-indigo-800 bg-indigo-800/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-indigo-300" />
            <div className="text-sm">
              <p className="font-semibold text-white">{currentTime}</p>
              <p className="text-xs text-indigo-300">{currentDate}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          <TooltipProvider delayDuration={0}>
            {sidebarItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-indigo-100 hover:text-white hover:bg-indigo-800 transition-all duration-200",
                        isActiveRoute(item.path) && "bg-indigo-700 text-white shadow-lg",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                      {!collapsed && <span>{item.name}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>
      
      <div className={cn(
        "p-4 border-t border-indigo-800",
        collapsed && "flex flex-col items-center"
      )}>
        {!collapsed ? (
          <div className="flex items-center p-2 rounded-md bg-indigo-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-indigo-300">admin@edusanskriti.com</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mb-2">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-red-300 hover:text-red-200 hover:bg-indigo-800",
            collapsed && "justify-center p-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
