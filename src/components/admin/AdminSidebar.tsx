
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Users,
  ShoppingBag,
  FolderTree,
  Award,
  Newspaper,
  HelpCircle,
  Megaphone,
  Trophy,
  Settings,
  CreditCard,
  Wallet,
  Calendar,
  Briefcase
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: FileText, label: 'Study Materials', href: '/admin/study-materials' },
  { icon: GraduationCap, label: 'Past Papers', href: '/admin/past-papers' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: ShoppingBag, label: 'Marketplace', href: '/admin/marketplace' },
  { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
  { icon: Award, label: 'Grades', href: '/admin/grades' },
  { icon: Newspaper, label: 'Blog', href: '/admin/blog' },
  { icon: HelpCircle, label: 'Queries', href: '/admin/queries' },
  { icon: Megaphone, label: 'Advertisements', href: '/admin/advertisements' },
  { icon: Trophy, label: 'Achievements', href: '/admin/achievements' },
  { icon: CreditCard, label: 'Payment Verification', href: '/admin/payments' },
  { icon: Wallet, label: 'Withdrawals', href: '/admin/withdrawals' },
  { icon: Calendar, label: 'Events', href: '/admin/events' },
  { icon: Briefcase, label: 'Job Listings', href: '/admin/jobs' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors",
                isActive && "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
