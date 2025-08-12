
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCalendar from '@/components/events/EventCalendar';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const EventsPage = () => {
  const { user } = useAuth();
  const { notifyEventReminder } = useNotificationTrigger();

  useEffect(() => {
    if (user) {
      // Show upcoming events notification
      notifyEventReminder(
        'Upcoming Events',
        'Check out the latest events and webinars in your area of study!'
      );
    }
  }, [user, notifyEventReminder]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 w-full">
        <div className="container mx-auto px-4">
          <EventCalendar />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
