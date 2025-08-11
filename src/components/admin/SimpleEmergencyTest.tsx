import React from 'react';

const SimpleEmergencyTest = () => {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Emergency Admin Access</h1>
        <p className="text-gray-700 mb-6">
          If you can see this page, routing is working! This is a simple test component.
        </p>
        
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded border">
            <p className="text-sm text-blue-800">
              <strong>Current URL:</strong> {window.location.href}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded border">
            <p className="text-sm text-green-800">
              <strong>Timestamp:</strong> {new Date().toLocaleString()}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border">
            <p className="text-sm text-yellow-800">
              <strong>Browser:</strong> {navigator.userAgent.substring(0, 50)}...
            </p>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            Try these URLs if this one works:
          </p>
          <div className="text-xs space-y-1">
            <p className="text-blue-600">• /emergency-admin</p>
            <p className="text-blue-600">• /admin-emergency</p>
            <p className="text-blue-600">• /fix-admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEmergencyTest;
