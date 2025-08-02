
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Briefcase, 
  MapPin, 
  Clock,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  X
} from 'lucide-react';

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
  experience_required?: string;
  skills_required?: string[];
  application_url?: string;
  application_deadline?: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const JobsManager = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    job_type: 'internship' as Job['job_type'],
    location: '',
    is_remote: false,
    stipend: '',
    salary_min: '',
    salary_max: '',
    experience_required: '',
    skills_required: '',
    application_url: '',
    application_deadline: '',
    is_verified: false,
    is_featured: false
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job listings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...formData,
        stipend: formData.stipend ? parseInt(formData.stipend) : null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        skills_required: formData.skills_required ? formData.skills_required.split(',').map(s => s.trim()) : null,
        location: formData.location || null,
        description: formData.description || null,
        experience_required: formData.experience_required || null,
        application_url: formData.application_url || null,
        application_deadline: formData.application_deadline || null
      };

      if (editingJob) {
        const { error } = await supabase
          .from('job_listings')
          .update(jobData)
          .eq('id', editingJob.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Job listing updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('job_listings')
          .insert([jobData]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Job listing created successfully'
        });
      }

      loadJobs();
      resetForm();
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: 'Error',
        description: 'Failed to save job listing',
        variant: 'destructive'
      });
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
      stipend: job.stipend?.toString() || '',
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      experience_required: job.experience_required || '',
      skills_required: job.skills_required?.join(', ') || '',
      application_url: job.application_url || '',
      application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().slice(0, 16) : '',
      is_verified: job.is_verified,
      is_featured: job.is_featured
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;

    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Job listing deleted successfully'
      });
      
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job listing',
        variant: 'destructive'
      });
    }
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('job_listings')
        .update({ is_verified: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Job listing ${!currentStatus ? 'verified' : 'unverified'} successfully`
      });
      
      loadJobs();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      job_type: 'internship',
      location: '',
      is_remote: false,
      stipend: '',
      salary_min: '',
      salary_max: '',
      experience_required: '',
      skills_required: '',
      application_url: '',
      application_deadline: '',
      is_verified: false,
      is_featured: false
    });
    setEditingJob(null);
    setShowForm(false);
  };

  const getJobTypeBadge = (type: string) => {
    const colors = {
      internship: 'bg-blue-100 text-blue-800',
      full_time: 'bg-green-100 text-green-800',
      part_time: 'bg-yellow-100 text-yellow-800',
      contract: 'bg-purple-100 text-purple-800',
      freelance: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || colors.internship;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Listings Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job Listing
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingJob ? 'Edit Job Listing' : 'Create New Job Listing'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company*</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="job_type">Job Type*</Label>
                  <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value as Job['job_type'] })}>
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                {formData.job_type === 'internship' && (
                  <div>
                    <Label htmlFor="stipend">Stipend (NPR/month)</Label>
                    <Input
                      id="stipend"
                      type="number"
                      value={formData.stipend}
                      onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                      min="0"
                    />
                  </div>
                )}

                {formData.job_type !== 'internship' && (
                  <>
                    <div>
                      <Label htmlFor="salary_min">Minimum Salary (NPR/year)</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="salary_max">Maximum Salary (NPR/year)</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                        min="0"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="experience_required">Experience Required</Label>
                  <Input
                    id="experience_required"
                    value={formData.experience_required}
                    onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                    placeholder="e.g., 1-2 years, Fresh graduates welcome"
                  />
                </div>

                <div>
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <Input
                    id="application_deadline"
                    type="datetime-local"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="skills_required">Required Skills (comma-separated)</Label>
                  <Input
                    id="skills_required"
                    value={formData.skills_required}
                    onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                    placeholder="React, Node.js, JavaScript, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="application_url">Application URL</Label>
                  <Input
                    id="application_url"
                    type="url"
                    value={formData.application_url}
                    onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                    placeholder="https://company.com/apply"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_remote}
                    onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                  />
                  <span>Remote Work</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  />
                  <span>Verified</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No job listings found</h3>
              <p className="text-gray-600">Create your first job listing to get started.</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {job.title} at {job.company}
                      {job.is_featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {job.is_verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <Badge className={getJobTypeBadge(job.job_type)}>
                        {job.job_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      {job.is_remote && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                      {(job.stipend || job.salary_min) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.stipend ? `NPR ${job.stipend}/month` : 
                           `NPR ${job.salary_min}${job.salary_max ? ` - ${job.salary_max}` : '+'}${job.job_type !== 'internship' ? '/year' : ''}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={job.is_verified ? "outline" : "default"}
                      onClick={() => toggleVerification(job.id, job.is_verified)}
                    >
                      {job.is_verified ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    {job.application_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(job)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {job.description && (
                <CardContent>
                  <p className="text-gray-700 mb-2">{job.description}</p>
                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-sm text-gray-600 mr-2">Skills:</span>
                      {job.skills_required.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobsManager;
