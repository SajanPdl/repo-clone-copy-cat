
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: 'exam' | 'fest' | 'webinar' | 'job_fair' | 'workshop' | 'other';
  start_date: string;
  end_date?: string;
  location?: string;
  region?: string;
  stream?: string;
  is_virtual: boolean;
  max_attendees?: number;
  registration_deadline?: string;
  is_featured: boolean;
  created_at: string;
}

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', searchTerm, selectedType, selectedRegion],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedType !== 'all') {
        query = query.eq('event_type', selectedType);
      }

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      const { data, error } = await query.order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data || [];
    }
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'fest': return 'bg-purple-100 text-purple-800';
      case 'webinar': return 'bg-blue-100 text-blue-800';
      case 'job_fair': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Upcoming Events
            </h1>
            <p className="text-gray-600 text-lg">Stay updated with academic events, webinars, and opportunities</p>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="fest">Fest</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="job_fair">Job Fair</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="kathmandu">Kathmandu</SelectItem>
                  <SelectItem value="pokhara">Pokhara</SelectItem>
                  <SelectItem value="chitwan">Chitwan</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No events found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-lg bg-white/80 border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      {event.is_featured && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type.replace('_', ' ')}
                      </Badge>
                      {event.is_virtual && <Badge variant="outline">Virtual</Badge>}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{format(new Date(event.start_date), 'PPP')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>{format(new Date(event.start_date), 'p')}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.max_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span>Max {event.max_attendees} attendees</span>
                        </div>
                      )}
                    </div>

                    {event.registration_deadline && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Registration Deadline:</strong> {format(new Date(event.registration_deadline), 'PPP')}
                        </p>
                      </div>
                    )}

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      Register Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
