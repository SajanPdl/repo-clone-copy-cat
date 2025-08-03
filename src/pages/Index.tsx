
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StudyMaterials from '@/components/StudyMaterials';
import PastPapers from '@/components/PastPapers';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import AppPromotion from '@/components/AppPromotion';
import MarketplaceFeature from '@/components/MarketplaceFeature';
import NotificationSystem from '@/components/NotificationSystem';
import { useQuery } from '@tanstack/react-query';
import { fetchStudyMaterials, fetchPastPapers, fetchBlogPosts } from '@/utils/queryUtils';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  // Fetch data for homepage sections
  const { data: studyMaterials, isLoading: materialsLoading, error: materialsError } = useQuery({
    queryKey: ['study-materials-homepage'],
    queryFn: () => fetchStudyMaterials(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: pastPapers, isLoading: papersLoading, error: papersError } = useQuery({
    queryKey: ['past-papers-homepage'],
    queryFn: () => fetchPastPapers(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: blogPosts, isLoading: blogLoading, error: blogError } = useQuery({
    queryKey: ['blog-posts-homepage'],
    queryFn: () => fetchBlogPosts(),
    staleTime: 5 * 60 * 1000,
  });

  // Log any errors for debugging
  React.useEffect(() => {
    if (materialsError) {
      console.error('Study materials error:', materialsError);
    }
    if (papersError) {
      console.error('Past papers error:', papersError);
    }
    if (blogError) {
      console.error('Blog posts error:', blogError);
    }
  }, [materialsError, papersError, blogError]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NotificationSystem />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Study Materials Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Study Materials
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Access high-quality study materials for all subjects and grades
            </p>
          </div>
          
          {materialsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : materialsError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Failed to load study materials</p>
              <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
            </div>
          ) : (
            <StudyMaterials materials={studyMaterials || []} />
          )}
        </div>
      </section>

      {/* Past Papers Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Past Papers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Practice with previous years' examination papers
            </p>
          </div>
          
          {papersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : papersError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Failed to load past papers</p>
              <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
            </div>
          ) : (
            <PastPapers papers={pastPapers || []} />
          )}
        </div>
      </section>

      {/* Marketplace Feature */}
      <MarketplaceFeature />

      {/* Blog Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Latest Blog Posts
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stay updated with educational insights and tips
            </p>
          </div>
          
          {blogLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : blogError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Failed to load blog posts</p>
              <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
            </div>
          ) : (
            <BlogSection posts={blogPosts || []} />
          )}
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* App Promotion */}
      <AppPromotion />

      {/* Footer */}
      <Footer />

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default Index;
