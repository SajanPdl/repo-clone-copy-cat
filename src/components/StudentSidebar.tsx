
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  Upload,
  ShoppingCart,
  Heart,
  Bell,
  BarChart3,
  User,
  Settings,
  Home,
  MessageSquare,
  Trophy,
  Wallet,
  FileText,
  Calendar,
  Bot,
  Users,
  Timer,
  CreditCard
} from 'lucide-react';

const mainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Overview', url: '/dashboard/overview', icon: BarChart3 },
  { title: 'My Notes', url: '/study-materials', icon: BookOpen },
  { title: 'Upload Material', url: '/dashboard/upload', icon: Upload },
  { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
  { title: 'Events', url: '/events', icon: Calendar },
  { title: 'AI Assistant', url: '/ai-assistant', icon: Bot },
  { title: 'Daily Planner', url: '/planner', icon: Timer },
];

const toolsItems = [
  { title: 'Saved Items', url: '/dashboard/saved', icon: Heart },
  { title: 'Messages', url: '/dashboard/inbox', icon: MessageSquare },
  { title: 'Seller Wallet', url: '/wallet', icon: Wallet },
  { title: 'Ambassador', url: '/referral', icon: Users },
];

const profileItems = [
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Achievements', url: '/dashboard/achievements', icon: Trophy },
  { title: 'Rewards', url: '/dashboard/rewards', icon: CreditCard },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export function StudentSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/dashboard' && currentPath === '/dashboard') return true;
    if (path !== '/dashboard' && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavCls = (path: string) => 
    isActive(path) ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-60"} md:w-60`}
      variant="sidebar"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
