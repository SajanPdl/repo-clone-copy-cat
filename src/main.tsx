
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

// Create AuthProvider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Create AdsProvider component
const AdsProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdsProvider>
          <App />
          <Toaster />
        </AdsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
