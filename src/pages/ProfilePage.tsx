
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileManager from '@/components/profile/ProfileManager';

const ProfilePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">User Profile</h1>
          <ProfileManager />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
