import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Upload, 
  ShoppingCart, 
  Calendar, 
  Bot, 
  Clock, 
  Heart, 
  MessageSquare, 
  Wallet, 
  Users, 
  User, 
  Trophy, 
  Gift, 
  Settings,
  X,
  Menu
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const FixedSidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const [activeItem, setActiveItem] = useState('Seller Wallet');

  const navigationItems = [
    // Dashboard section
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Overview', icon: Home, href: '/overview' },
    { name: 'My Notes', icon: BookOpen, href: '/notes' },
    { name: 'Upload Material', icon: Upload, href: '/upload' },
    { name: 'Marketplace', icon: ShoppingCart, href: '/marketplace' },
    { name: 'Events', icon: Calendar, href: '/events' },
    { name: 'AI Assistant', icon: Bot, href: '/ai-assistant' },
    { name: 'Daily Planner', icon: Clock, href: '/planner' },
    
    // Tools section
    { name: 'Saved Items', icon: Heart, href: '/saved' },
    { name: 'Messages', icon: MessageSquare, href: '/messages' },
    { name: 'Seller Wallet', icon: Wallet, href: '/wallet' },
    { name: 'Ambassador', icon: Users, href: '/ambassador' },
    
    // Account section
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Achievements', icon: Trophy, href: '/achievements' },
    { name: 'Rewards', icon: Gift, href: '/rewards' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  const handleItemClick = (name: string) => {
    setActiveItem(name);
    // Close sidebar on mobile after item click
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4 border-b">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation content */}
        <nav className="p-4">
          {/* Dashboard Section */}
          <div className="sidebar-section">
            {navigationItems.slice(0, 8).map((item) => (
              <div
                key={item.name}
                className={`sidebar-nav-item ${activeItem === item.name ? 'active' : ''}`}
                onClick={() => handleItemClick(item.name)}
              >
                <item.icon className="sidebar-nav-icon" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          
          {/* Tools Section */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Tools</div>
            {navigationItems.slice(8, 12).map((item) => (
              <div
                key={item.name}
                className={`sidebar-nav-item ${activeItem === item.name ? 'active' : ''}`}
                onClick={() => handleItemClick(item.name)}
              >
                <item.icon className="sidebar-nav-icon" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          
          {/* Account Section */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Account</div>
            {navigationItems.slice(12).map((item) => (
              <div
                key={item.name}
                className={`sidebar-nav-item ${activeItem === item.name ? 'active' : ''}`}
                onClick={() => handleItemClick(item.name)}
              >
                <item.icon className="sidebar-nav-icon" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default FixedSidebar;
