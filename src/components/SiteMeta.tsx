import React, { useEffect } from 'react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const SiteMeta = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings.favicon_url]);

  useEffect(() => {
    document.title = settings.meta_title || settings.site_name || 'MeroAcademy';
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    if (settings.meta_description) setMeta('description', settings.meta_description);
    if (settings.og_title) setMeta('og:title', settings.og_title);
    if (settings.og_description) setMeta('og:description', settings.og_description);
    if (settings.og_image) setMeta('og:image', settings.og_image);
    if (settings.google_analytics_id) setMeta('google-analytics', settings.google_analytics_id);
  }, [settings]);

  return null;
};

export default SiteMeta;
