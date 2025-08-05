
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon, MapPin, Clock, Users } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  region?: string;
  event_type: string;
  is_virtual: boolean;
  is_featured: boolean;
  max_attendees?: number;
  registration_deadline?: string;
  stream?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

const InteractiveEventCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [date, setDate] = useState(new Date());
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

      if (error) throw error;

      const eventsData = data || [];
      setEvents(eventsData);

      // Convert to calendar format
      const calendarEventsData = eventsData.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date),
        end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
        resource: event,
      }));

      setCalendarEvents(calendarEventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setIsDialogOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    console.log('Selected slot:', { start, end });
    // Could implement "Add Event" functionality here for admins
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = event.resource.event_type;
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    switch (eventType) {
      case 'exam':
        backgroundColor = '#dc2626';
        borderColor = '#dc2626';
        break;
      case 'webinar':
        backgroundColor = '#2563eb';
        borderColor = '#2563eb';
        break;
      case 'workshop':
        backgroundColor = '#059669';
        borderColor = '#059669';
        break;
      case 'conference':
        backgroundColor = '#7c3aed';
        borderColor = '#7c3aed';
        break;
      case 'competition':
        backgroundColor = '#ea580c';
        borderColor = '#ea580c';
        break;
      case 'job-fair':
        backgroundColor = '#ca8a04';
        borderColor = '#ca8a04';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'exam': 'bg-red-100 text-red-800',
      'webinar': 'bg-blue-100 text-blue-800',
      'workshop': 'bg-green-100 text-green-800',
      'conference': 'bg-purple-100 text-purple-800',
      'competition': 'bg-orange-100 text-orange-800',
      'job-fair': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Interactive Event Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Day
            </Button>
            <Button
              variant={view === 'agenda' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('agenda')}
            >
              Agenda
            </Button>
          </div>

          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              popup
              tooltipAccessor={(event) => event.resource.description || event.title}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getEventTypeColor(selectedEvent.event_type)}>
                  {selectedEvent.event_type.replace('-', ' ')}
                </Badge>
                {selectedEvent.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                )}
              </div>

              {selectedEvent.description && (
                <p className="text-gray-600">{selectedEvent.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(selectedEvent.start_date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatTime(selectedEvent.start_date)}</span>
                  {selectedEvent.end_date && (
                    <span> - {formatTime(selectedEvent.end_date)}</span>
                  )}
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedEvent.is_virtual ? 'Online' : selectedEvent.location}</span>
                    {selectedEvent.region && (
                      <Badge variant="outline">{selectedEvent.region}</Badge>
                    )}
                  </div>
                )}

                {selectedEvent.max_attendees && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Max {selectedEvent.max_attendees} attendees</span>
                  </div>
                )}

                {selectedEvent.registration_deadline && (
                  <div className="text-red-600 text-sm">
                    Registration deadline: {formatDate(selectedEvent.registration_deadline)}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  Add to Calendar
                </Button>
                {selectedEvent.stream && (
                  <Button variant="outline" className="flex-1">
                    Register
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveEventCalendar;
