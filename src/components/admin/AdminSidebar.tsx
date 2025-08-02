
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  ShoppingBag, 
  Users, 
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Tag,
  GraduationCap,
  CreditCard,
  Wallet,
  Calendar,
  Briefcase,
  UserPlus,
  Store,
  Megaphone
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar = ({ collapsed, setCollapsed }: AdminSidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { title: 'Study Materials', icon: BookOpen, href: '/admin/materials' },
    { title: 'Past Papers', icon: FileText, href: '/admin/papers' },
    { title: 'Marketplace', icon: ShoppingBag, href: '/admin/marketplace' },
    { title: 'Categories', icon: Tag, href: '/admin/categories' },
    { title: 'Grades', icon: GraduationCap, href: '/admin/grades' },
    { title: 'Users', icon: Users, href: '/admin/users' },
    { title: 'User Queries', icon: MessageSquare, href: '/admin/queries' },
    { title: 'Advertisements', icon: Megaphone, href: '/admin/ads' },
    { title: 'Ad Placements', icon: BarChart3, href: '/admin/ad-placements' },
    { title: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { title: 'Payments', icon: CreditCard, href: '/admin/payments' },
    { title: 'Withdrawals', icon: Wallet, href: '/admin/withdrawals' },
    { title: 'Events', icon: Calendar, href: '/admin/events' },
    { title: 'Jobs/Internships', icon: Briefcase, href: '/admin/jobs' },
    { title: 'Referral Program', icon: UserPlus, href: '/admin/referrals' },
    { title: 'Merch Store', icon: Store, href: '/admin/merch' },
    { title: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || (href === '/admin/dashboard' && location.pathname === '/admin');
  };

  return (
    <div className={cn(
      "h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduAdmin
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                isActive(item.href) 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default AdminSidebar;
