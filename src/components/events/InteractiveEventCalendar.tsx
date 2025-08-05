
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  category?: string;
}

const InteractiveEventCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        // Use mock data as fallback
        const mockEvents = [
          {
            id: '1',
            title: 'Math Olympiad 2025',
            description: 'National Mathematics Competition for high school students',
            start: new Date(2025, 2, 15, 10, 0),
            end: new Date(2025, 2, 15, 16, 0),
            location: 'Kathmandu University',
            category: 'competition'
          },
          {
            id: '2',
            title: 'Science Fair',
            description: 'Annual science exhibition showcasing student projects',
            start: new Date(2025, 3, 10, 9, 0),
            end: new Date(2025, 3, 12, 17, 0),
            location: 'Tribhuvan University',
            category: 'exhibition'
          }
        ];
        setEvents(mockEvents);
      } else {
        const formattedEvents = data.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start: new Date(event.start_date),
          end: new Date(event.end_date),
          location: event.location,
          category: event.category
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const eventStyleGetter = (event: Event) => {
    const backgroundColor = event.category === 'competition' ? '#3b82f6' : '#10b981';
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Interactive Event Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '500px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              popup
              tooltipAccessor="description"
            />
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedEvent.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={selectedEvent.category === 'competition' ? 'default' : 'secondary'}>
                    {selectedEvent.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {moment(selectedEvent.start).format('MMM DD, YYYY - h:mm A')}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700">{selectedEvent.description}</p>
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedEvent.location}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm">Register</Button>
                <Button variant="outline" size="sm">Add to Calendar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveEventCalendar;
