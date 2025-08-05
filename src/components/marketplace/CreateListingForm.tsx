
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createMarketplaceListing } from '@/utils/marketplaceUtils';
import { Upload, DollarSign, MapPin } from 'lucide-react';

const CreateListingForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subject: '',
    university: '',
    condition: '',
    price: '',
    is_free: false,
    location: '',
    contact_info: {
      phone: '',
      email: user?.email || '',
      whatsapp: ''
    }
  });

  const categories = [
    { value: 'book', label: 'Books' },
    { value: 'notes', label: 'Notes' },
    { value: 'pdf', label: 'PDF Materials' },
    { value: 'question_bank', label: 'Question Banks' },
    { value: 'calculator', label: 'Calculators' },
    { value: 'device', label: 'Electronic Devices' },
    { value: 'other', label: 'Other' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a listing',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.title || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const listingData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category as "book" | "notes" | "pdf" | "question_bank" | "calculator" | "device" | "other",
        subject: formData.subject,
        university: formData.university,
        condition: formData.condition,
        price: formData.is_free ? null : parseFloat(formData.price) || null,
        is_free: formData.is_free,
        location: formData.location,
        contact_info: formData.contact_info,
        images: null,
        is_approved: false, // Add this missing property
        is_featured: false,
        status: 'active' as const
      };

      await createMarketplaceListing(listingData);

      toast({
        title: 'Success',
        description: 'Your listing has been created and is pending approval'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        subject: '',
        university: '',
        condition: '',
        price: '',
        is_free: false,
        location: '',
        contact_info: {
          phone: '',
          email: user.email || '',
          whatsapp: ''
        }
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Create New Listing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter listing title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Subject (e.g., Mathematics)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="University name"
              />
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
              />
              <Label htmlFor="is_free">This item is free</Label>
            </div>

            {!formData.is_free && (
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price (NPR)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter price in NPR"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Area"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.contact_info.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, phone: e.target.value }
                  })}
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.contact_info.whatsapp}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, whatsapp: e.target.value }
                  })}
                  placeholder="WhatsApp number"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateListingForm;
