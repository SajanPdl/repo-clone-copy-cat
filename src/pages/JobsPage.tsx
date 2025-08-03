
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, Clock, Building, Search, Filter, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  experience: string;
  salary: string;
  skills: string[];
  postedDate: string;
  deadline: string;
}

const JobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Mock data for jobs
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Junior Software Developer',
      company: 'Tech Solutions Nepal',
      description: 'We are looking for a passionate junior software developer to join our team.',
      location: 'Kathmandu',
      type: 'full-time',
      experience: '0-2 years',
      salary: 'Rs. 30,000 - 50,000',
      skills: ['JavaScript', 'React', 'Node.js'],
      postedDate: '2024-01-10',
      deadline: '2024-02-10'
    },
    {
      id: '2',
      title: 'Marketing Intern',
      company: 'Creative Agency',
      description: 'Join our marketing team as an intern and gain valuable experience.',
      location: 'Pokhara',
      type: 'internship',
      experience: 'Entry level',
      salary: 'Rs. 15,000 - 20,000',
      skills: ['Social Media', 'Content Writing', 'Photoshop'],
      postedDate: '2024-01-12',
      deadline: '2024-01-30'
    },
    {
      id: '3',
      title: 'Data Analyst',
      company: 'Data Corp',
      description: 'Analyze data to provide insights for business decisions.',
      location: 'Lalitpur',
      type: 'full-time',
      experience: '2-4 years',
      salary: 'Rs. 60,000 - 80,000',
      skills: ['Python', 'SQL', 'Tableau'],
      postedDate: '2024-01-15',
      deadline: '2024-02-15'
    }
  ];

  const { data: jobs = mockJobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      return mockJobs;
    }
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'part-time': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'internship': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'contract': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Job Opportunities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find internships, part-time jobs, and full-time positions that match your skills
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs, companies, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Kathmandu">Kathmandu</SelectItem>
              <SelectItem value="Pokhara">Pokhara</SelectItem>
              <SelectItem value="Lalitpur">Lalitpur</SelectItem>
              <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                        <Building className="h-4 w-4 mr-2" />
                        {job.company}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 mr-2" />
                        {job.location}
                      </div>
                    </div>
                    <Badge className={getJobTypeColor(job.type)}>
                      {job.type.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {job.description}
                  </CardDescription>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Experience: {job.experience}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Salary: {job.salary}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      Posted: {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>Apply Now</Button>
                    <Button variant="outline">Save Job</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Briefcase className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
