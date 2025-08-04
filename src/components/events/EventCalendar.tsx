
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Filter, Search } from 'lucide-react';

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
  created_at: string;
}

const EventCalendar = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, typeFilter, regionFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Annual Science Fair 2024',
          description: 'Join us for the biggest science exhibition of the year featuring innovative projects from students across Nepal.',
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Kathmandu University',
          region: 'kathmandu',
          event_type: 'conference',
          is_virtual: false,
          is_featured: true,
          max_attendees: 500,
          registration_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Online Physics Webinar',
          description: 'Learn advanced physics concepts from expert professors in this interactive online session.',
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Online',
          region: 'online',
          event_type: 'webinar',
          is_virtual: true,
          is_featured: false,
          max_attendees: 100,
          created_at: new Date().toISOString()
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.event_type === typeFilter);
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(event => event.region === regionFilter);
    }

    setFilteredEvents(filtered);
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
      weekday: 'short',
      month: 'short',
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

  const addToCalendar = (event: Event) => {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || '')}`;
    
    window.open(googleCalendarUrl, '_blank');
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
      <div>
        <h1 className="text-3xl font-bold">Event Calendar</h1>
        <p className="text-gray-600 mt-2">Stay updated with upcoming educational events</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
                <SelectItem value="webinar">Webinars</SelectItem>
                <SelectItem value="workshop">Workshops</SelectItem>
                <SelectItem value="conference">Conferences</SelectItem>
                <SelectItem value="competition">Competitions</SelectItem>
                <SelectItem value="job-fair">Job Fairs</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="kathmandu">Kathmandu</SelectItem>
                <SelectItem value="pokhara">Pokhara</SelectItem>
                <SelectItem value="chitwan">Chitwan</SelectItem>
                <SelectItem value="dharan">Dharan</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setRegionFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {event.is_featured && (
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                  </div>
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {event.event_type.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(event.start_date)}</span>
                    <Clock className="h-4 w-4 text-gray-500 ml-4" />
                    <span>{formatTime(event.start_date)}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{event.is_virtual ? 'Online' : event.location}</span>
                      {event.region && <Badge variant="outline" className="ml-2">{event.region}</Badge>}
                    </div>
                  )}

                  {event.max_attendees && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Max {event.max_attendees} attendees</span>
                    </div>
                  )}

                  {event.registration_deadline && (
                    <div className="text-red-600 text-xs">
                      Registration deadline: {formatDate(event.registration_deadline)}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => addToCalendar(event)}
                    className="flex-1"
                  >
                    Add to Calendar
                  </Button>
                  {event.stream && (
                    <Button size="sm" variant="outline" className="flex-1">
                      Register
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
