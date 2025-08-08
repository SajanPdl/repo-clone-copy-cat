import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchAllSettings, SiteSetting } from '@/utils/settingsUtils';

interface SiteSettings {
  [key: string]: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    setLoading(true);
    try {
      const all = await fetchAllSettings();
      const mapped: SiteSettings = {};
      all.forEach((s) => {
        mapped[s.setting_key] = s.setting_value;
      });
      setSettings(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, refreshSettings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
};
