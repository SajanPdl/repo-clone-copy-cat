
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Clock, ExternalLink, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  id: string;
  title: string;
  company: string;
  description?: string;
  job_type: 'internship' | 'full_time' | 'part_time' | 'contract' | 'freelance';
  location?: string;
  is_remote: boolean;
  stipend?: number;
  salary_min?: number;
  salary_max?: number;
  application_url?: string;
  application_deadline?: string;
  experience_required?: string;
  skills_required?: string[];
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
}

const JobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', searchTerm, selectedType, selectedLocation],
    queryFn: async () => {
      let query = supabase
        .from('job_listings')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedType !== 'all') {
        query = query.eq('job_type', selectedType);
      }

      if (selectedLocation !== 'all') {
        if (selectedLocation === 'remote') {
          query = query.eq('is_remote', true);
        } else {
          query = query.ilike('location', `%${selectedLocation}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }

      return data || [];
    }
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'internship': return 'bg-blue-100 text-blue-800';
      case 'full_time': return 'bg-green-100 text-green-800';
      case 'part_time': return 'bg-yellow-100 text-yellow-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'freelance': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount);
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
              Career Opportunities
            </h1>
            <p className="text-gray-600 text-lg">Find internships and job opportunities for students</p>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="kathmandu">Kathmandu</SelectItem>
                  <SelectItem value="pokhara">Pokhara</SelectItem>
                  <SelectItem value="chitwan">Chitwan</SelectItem>
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
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-lg bg-white/80 border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                        <p className="text-sm text-gray-600 font-medium">{job.company}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {job.is_featured && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            Featured
                          </Badge>
                        )}
                        {job.is_verified && (
                          <Badge className="bg-green-500 text-white">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getJobTypeColor(job.job_type)}>
                        {job.job_type.replace('_', ' ')}
                      </Badge>
                      {job.is_remote && <Badge variant="outline">Remote</Badge>}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {job.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {job.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {job.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        <span>
                          {job.job_type === 'internship' 
                            ? `Stipend: ${formatCurrency(job.stipend)}`
                            : `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                          }
                        </span>
                      </div>
                      
                      {job.experience_required && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span>{job.experience_required}</span>
                        </div>
                      )}
                    </div>

                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.skills_required.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.skills_required.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {job.application_deadline && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Apply by:</strong> {new Date(job.application_deadline).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                      
                      {job.application_url ? (
                        <Button size="sm" asChild>
                          <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Apply Now
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          Contact HR
                        </Button>
                      )}
                    </div>
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

export default JobsPage;
