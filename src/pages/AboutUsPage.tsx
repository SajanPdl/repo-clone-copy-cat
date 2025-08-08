
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 w-full">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                About MeroAcademy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg text-gray-600 text-center mb-8">
                Empowering students with quality educational resources and innovative learning tools.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                  <p className="text-gray-600">
                    To democratize access to quality educational resources and create a collaborative learning environment 
                    where students can share knowledge, excel academically, and build successful careers.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
                  <p className="text-gray-600">
                    To be the leading platform for student-centered learning, fostering academic excellence through 
                    innovative technology and community-driven educational resources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
