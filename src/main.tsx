
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/hooks/useAuth';
import { AdsProvider } from '@/components/ads/AdsProvider';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <AdsProvider>
          <App />
        </AdsProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
