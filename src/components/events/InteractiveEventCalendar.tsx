
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  event_type: string;
  is_virtual: boolean;
  max_attendees?: number;
  region?: string;
}

const InteractiveEventCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      const formattedEvents = data?.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date),
        end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
        description: event.description,
        location: event.location,
        event_type: event.event_type,
        is_virtual: event.is_virtual,
        max_attendees: event.max_attendees,
        region: event.region
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Engineering Entrance Prep Workshop',
          start: new Date(2024, 1, 15, 10, 0),
          end: new Date(2024, 1, 15, 16, 0),
          description: 'Comprehensive workshop for engineering entrance exam preparation',
          location: 'Kathmandu University',
          event_type: 'workshop',
          is_virtual: false,
          max_attendees: 100,
          region: 'Kathmandu'
        },
        {
          id: '2',
          title: 'Science Fair 2024',
          start: new Date(2024, 1, 20, 9, 0),
          end: new Date(2024, 1, 22, 17, 0),
          description: 'Annual science fair showcasing student projects',
          location: 'Virtual Event',
          event_type: 'fair',
          is_virtual: true,
          max_attendees: 500,
          region: 'All Nepal'
        }
      ];
      setEvents(mockEvents);
      toast({
        title: "Using demo data",
        description: "Could not fetch real events, showing sample events."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.event_type) {
      case 'workshop':
        backgroundColor = '#10B981';
        break;
      case 'seminar':
        backgroundColor = '#F59E0B';
        break;
      case 'fair':
        backgroundColor = '#8B5CF6';
        break;
      case 'exam':
        backgroundColor = '#EF4444';
        break;
      default:
        backgroundColor = '#3174ad';
    }

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Calendar</h1>
          <p className="text-gray-600 mt-2">Stay updated with upcoming educational events</p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 600 }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  onNavigate={handleNavigate}
                  onView={handleViewChange}
                  view={view}
                  date={date}
                  eventPropGetter={eventStyleGetter}
                  popup
                  showMultiDayTimes
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedEvent ? 'Event Details' : 'Upcoming Events'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvent ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                    <Badge variant="outline" className="mt-1">
                      {selectedEvent.event_type}
                    </Badge>
                  </div>
                  
                  {selectedEvent.description && (
                    <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm A')}
                    </div>
                    
                    {selectedEvent.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedEvent.location}
                        {selectedEvent.is_virtual && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Virtual
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {selectedEvent.max_attendees && (
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        Max: {selectedEvent.max_attendees} attendees
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full">
                    Register for Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-gray-500">
                        {moment(event.start).format('MMM Do, h:mm A')}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEventCalendar;
