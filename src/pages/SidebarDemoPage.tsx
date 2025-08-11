import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';

const SidebarDemoPage: React.FC = () => {
  return (
    <SidebarLayout showSidebar={true}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Sidebar Layout Demo
        </h1>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Fixed Sidebar Solution
            </h2>
            <p className="text-gray-600 mb-4">
              This page demonstrates the fixed sidebar layout that properly handles positioning
              to prevent overlapping with the navbar.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Key Features:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>✅ Fixed navbar with proper z-index</li>
                <li>✅ Sidebar positioned below navbar (no overlap)</li>
                <li>✅ Responsive design with mobile menu</li>
                <li>✅ Smooth transitions and animations</li>
                <li>✅ Proper spacing and margins</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              How It Works
            </h2>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>Navbar:</strong> Fixed position at top with z-index 1000
              </p>
              <p>
                <strong>Sidebar:</strong> Fixed position with top margin to account for navbar height
              </p>
              <p>
                <strong>Content:</strong> Properly spaced with left margin on desktop, full width on mobile
              </p>
              <p>
                <strong>Mobile:</strong> Overlay sidebar with hamburger menu toggle
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              CSS Classes Used
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <div className="space-y-2">
                <div><span className="text-purple-600">.navbar</span> - Fixed navbar styling</div>
                <div><span className="text-purple-600">.sidebar-container</span> - Sidebar positioning</div>
                <div><span className="text-purple-600">.sidebar-overlay</span> - Mobile overlay</div>
                <div><span className="text-purple-600">.main-content-with-sidebar</span> - Content spacing</div>
                <div><span className="text-purple-600">.z-navbar</span> - Navbar z-index</div>
                <div><span className="text-purple-600">.z-sidebar</span> - Sidebar z-index</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarDemoPage;
