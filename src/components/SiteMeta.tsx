
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SiteMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SiteMeta: React.FC<SiteMetaProps> = ({
  title = 'StudyBuddy - Your Academic Companion',
  description = 'Access comprehensive study materials, past papers, and connect with fellow students. Your journey to academic excellence starts here.',
  keywords = 'study materials, past papers, education, Nepal, university, academic, learning',
  image = '/placeholder.svg',
  url = window.location.href
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SiteMeta;
