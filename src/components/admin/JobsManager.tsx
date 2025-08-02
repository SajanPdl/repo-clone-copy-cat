
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, MapPin, Clock, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  updated_at: string;
}

const JobsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    job_type: 'internship' as Job['job_type'],
    location: '',
    is_remote: false,
    stipend: 0,
    salary_min: 0,
    salary_max: 0,
    application_url: '',
    application_deadline: '',
    experience_required: '',
    skills_required: [] as string[],
    is_verified: false,
    is_featured: false
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(job => ({
        ...job,
        job_type: job.job_type as Job['job_type']
      })) as Job[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('job_listings')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast({ title: 'Job created successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating job', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Job> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('job_listings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast({ title: 'Job updated successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating job', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast({ title: 'Job deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting job', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      job_type: 'internship',
      location: '',
      is_remote: false,
      stipend: 0,
      salary_min: 0,
      salary_max: 0,
      application_url: '',
      application_deadline: '',
      experience_required: '',
      skills_required: [],
      is_verified: false,
      is_featured: false
    });
    setEditingJob(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description || '',
      job_type: job.job_type,
      location: job.location || '',
      is_remote: job.is_remote,
      stipend: job.stipend || 0,
      salary_min: job.salary_min || 0,
      salary_max: job.salary_max || 0,
      application_url: job.application_url || '',
      application_deadline: job.application_deadline || '',
      experience_required: job.experience_required || '',
      skills_required: job.skills_required || [],
      is_verified: job.is_verified,
      is_featured: job.is_featured
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            {editingJob ? 'Edit Job' : 'Create New Job'}
          </h2>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value: Job['job_type']) => 
                      setFormData({ ...formData, job_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stipend/Salary Min (NPR)</label>
                  <Input
                    type="number"
                    value={formData.job_type === 'internship' ? formData.stipend : formData.salary_min}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (formData.job_type === 'internship') {
                        setFormData({ ...formData, stipend: value });
                      } else {
                        setFormData({ ...formData, salary_min: value });
                      }
                    }}
                  />
                </div>

                {formData.job_type !== 'internship' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Salary Max (NPR)</label>
                    <Input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({ ...formData, salary_max: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Application URL</label>
                  <Input
                    type="url"
                    value={formData.application_url}
                    onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Application Deadline</label>
                  <Input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Experience Required</label>
                <Input
                  value={formData.experience_required}
                  onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                  placeholder="e.g., 0-1 years, Fresh graduate"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_remote}
                    onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                  />
                  <span className="text-sm">Remote Work</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  />
                  <span className="text-sm">Verified Job</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span className="text-sm">Featured Job</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Job Listings Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage internships and job opportunities</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <motion.div key={job.id} layout>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{job.company}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(job)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.job_type}</Badge>
                    {job.is_remote && <Badge>Remote</Badge>}
                    {job.is_verified && <Badge className="bg-green-500">Verified</Badge>}
                    {job.is_featured && <Badge className="bg-purple-500">Featured</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {job.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {job.job_type === 'internship' 
                        ? `Stipend: ${formatCurrency(job.stipend)}`
                        : `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                      }
                    </div>
                    
                    {job.application_deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Apply by: {new Date(job.application_deadline).toLocaleDateString()}
                      </div>
                    )}

                    {job.application_url && (
                      <div className="pt-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Apply Now
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Start by creating your first job listing.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JobsManager;
