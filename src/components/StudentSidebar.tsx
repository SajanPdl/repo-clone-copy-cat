
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
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';

const mainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
  { title: 'Overview', url: '/dashboard/overview', icon: BarChart3, gradient: 'from-purple-500 to-pink-500' },
  { title: 'My Notes', url: '/study-materials', icon: BookOpen, gradient: 'from-green-500 to-emerald-500' },
  { title: 'Upload Material', url: '/dashboard/upload', icon: Upload, gradient: 'from-orange-500 to-red-500' },
  { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart, gradient: 'from-indigo-500 to-purple-500' },
  { title: 'Saved Items', url: '/dashboard/saved', icon: Heart, gradient: 'from-red-500 to-rose-500' },
  { title: 'Messages', url: '/dashboard/inbox', icon: MessageSquare, gradient: 'from-teal-500 to-cyan-500' },
];

const profileItems = [
  { title: 'Profile', url: '/profile', icon: User, gradient: 'from-gray-500 to-gray-600' },
  { title: 'Achievements', url: '/dashboard/achievements', icon: Trophy, gradient: 'from-yellow-500 to-orange-500' },
  { title: 'Rewards', url: '/dashboard/rewards', icon: Wallet, gradient: 'from-green-500 to-teal-500' },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings, gradient: 'from-slate-500 to-gray-500' },
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

  const getNavCls = (path: string, gradient: string) => 
    isActive(path) 
      ? `bg-gradient-to-r ${gradient} text-white font-medium shadow-lg` 
      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-72"} bg-white/95 backdrop-blur-lg border-r border-gray-200/50 shadow-xl`}
      variant="sidebar"
    >
      <SidebarContent className="py-6">
        {/* Logo/Brand Section */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Hub
                </h2>
                <p className="text-xs text-gray-500">Learning Dashboard</p>
              </div>
            </div>
          </motion.div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {mainItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink 
                        to={item.url} 
                        className={`${getNavCls(item.url, item.gradient)} flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 group relative overflow-hidden`}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isActive(item.url) 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <item.icon className={`h-4 w-4 transition-all duration-300 ${
                            isActive(item.url) ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                          }`} />
                        </div>
                        {!isCollapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                        {isActive(item.url) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3"
                          >
                            <Sparkles className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </NavLink>
                    </motion.div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 mb-2">
            Account & Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {profileItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (mainItems.length + index) * 0.1 }}
                    >
                      <NavLink 
                        to={item.url} 
                        className={`${getNavCls(item.url, item.gradient)} flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 group relative overflow-hidden`}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isActive(item.url) 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <item.icon className={`h-4 w-4 transition-all duration-300 ${
                            isActive(item.url) ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                          }`} />
                        </div>
                        {!isCollapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                        {isActive(item.url) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3"
                          >
                            <Sparkles className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </NavLink>
                    </motion.div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom decoration */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-auto px-6 py-4"
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-4 border border-blue-200/20">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-gray-700">Pro Tip</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Upload quality materials to earn points and unlock achievements!
              </p>
            </div>
          </motion.div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
