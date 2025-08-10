
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
  title = "Education Platform - Your Gateway to Academic Excellence",
  description = "Access premium study materials, past papers, and connect with Nepal's brightest students. Your success story starts here.",
  keywords = "education, study materials, past papers, Nepal, academic, learning",
  image = "/placeholder.svg",
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
      
      {/* Additional Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SiteMeta;
