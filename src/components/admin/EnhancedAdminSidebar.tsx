
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MapPin,
  Calendar,
  Wallet,
  Receipt,
  Shield,
  TrendingUp,
  Star,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getNepaliDate, getNepaliTime } from '@/utils/nepaliDate';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedAdminSidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const EnhancedAdminSidebar = ({ collapsed = false, setCollapsed }: EnhancedAdminSidebarProps) => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [pendingCounts, setPendingCounts] = useState({
    materials: 0,
    payments: 0,
    withdrawals: 0,
    queries: 0
  });
  
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
      path: '/admin/materials',
      badge: pendingCounts.materials > 0 ? pendingCounts.materials : undefined
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
      name: 'Merchandise',
      icon: Tag,
      id: 'merch',
      path: '/admin/merch'
    },
    {
      name: 'Payment Verification',
      icon: Receipt,
      id: 'payments',
      path: '/admin/payments',
      badge: pendingCounts.payments > 0 ? pendingCounts.payments : undefined
    },
    {
      name: 'Wallet Management',
      icon: Wallet,
      id: 'wallets',
      path: '/admin/wallets',
      badge: pendingCounts.withdrawals > 0 ? pendingCounts.withdrawals : undefined
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
      name: 'Events Calendar',
      icon: Calendar,
      id: 'events',
      path: '/admin/events'
    },
    {
      name: 'Queries',
      icon: MessageSquare,
      id: 'queries',
      path: '/admin/queries',
      badge: pendingCounts.queries > 0 ? pendingCounts.queries : undefined
    },
    {
      name: 'Referral Program',
      icon: TrendingUp,
      id: 'referrals',
      path: '/admin/referrals'
    },
    {
      name: 'Achievements',
      icon: Star,
      id: 'achievements',
      path: '/admin/achievements'
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

  useEffect(() => {
    // Fetch pending counts for badges
    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCounts = async () => {
    // This would fetch actual pending counts from the database
    // For now, using mock data
    setPendingCounts({
      materials: 5,
      payments: 3,
      withdrawals: 2,
      queries: 8
    });
  };
  
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
    <aside className={cn(
      "h-full bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl border-r border-indigo-700",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className={cn(
        "p-6 border-b border-indigo-700 flex justify-between items-center bg-indigo-800/50",
        collapsed && "px-4 py-6 justify-center"
      )}>
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              MeroAcademy Admin
            </h2>
            <p className="text-indigo-300 text-sm">Management Panel</p>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">ES</h2>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-indigo-300 hover:text-white hover:bg-indigo-700 transition-colors"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Status Panel */}
      {!collapsed && (
        <div className="p-4 border-b border-indigo-700 bg-indigo-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-indigo-300" />
            <div className="text-sm">
              <p className="font-semibold text-white">{currentTime}</p>
              <p className="text-xs text-indigo-300">{currentDate}</p>
            </div>
          </div>
          <div className="text-xs text-indigo-200">
            System Status: <span className="text-green-400">● Online</span>
          </div>
        </div>
      )}
      
      {/* Navigation */}
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
                        "w-full justify-start text-indigo-100 hover:text-white hover:bg-indigo-700/50 transition-all duration-200 relative",
                        isActiveRoute(item.path) && "bg-indigo-600 text-white shadow-lg border border-indigo-500",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                      {collapsed && item.badge && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </div>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.name}
                    {item.badge && (
                      <Badge variant="secondary" className="bg-red-500 text-white">
                        {item.badge}
                      </Badge>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>
      
      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-indigo-700 bg-indigo-800/50",
        collapsed && "flex flex-col items-center"
      )}>
        {!collapsed ? (
          <div className="flex items-center p-3 rounded-lg bg-indigo-700/50 mb-3 border border-indigo-600">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-indigo-300">System Administrator</p>
            </div>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mb-3 border-2 border-indigo-500">
            <Shield className="h-6 w-6 text-white" />
          </div>
        )}
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors",
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

export default EnhancedAdminSidebar;
