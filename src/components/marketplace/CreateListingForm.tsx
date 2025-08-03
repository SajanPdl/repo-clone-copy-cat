
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Plus, MapPin, Phone, Mail } from 'lucide-react';
import { createMarketplaceListing, MarketplaceListing } from '@/utils/marketplaceUtils';
import { supabase } from '@/integrations/supabase/client';

interface CreateListingFormProps {
  onSuccess: (listing: MarketplaceListing) => void;
  onCancel: () => void;
}

const categories = [
  { value: 'book', label: '📚 Book', icon: '📚' },
  { value: 'notes', label: '📝 Notes', icon: '📝' },
  { value: 'pdf', label: '📄 PDF', icon: '📄' },
  { value: 'question_bank', label: '❓ Question Bank', icon: '❓' },
  { value: 'calculator', label: '🧮 Calculator', icon: '🧮' },
  { value: 'device', label: '💻 Device', icon: '💻' },
  { value: 'other', label: '🔍 Other', icon: '🔍' }
];

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'used', label: 'Used' },
  { value: 'fair', label: 'Fair' }
];

const CreateListingForm: React.FC<CreateListingFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as 'book' | 'notes' | 'pdf' | 'question_bank' | 'calculator' | 'device' | 'other' | '',
    subject: '',
    university: '',
    price: 0,
    is_free: false,
    condition: '' as 'new' | 'used' | 'fair' | 'excellent' | '',
    location: '',
    contact_info: {
      phone: '',
      email: '',
      preferred_contact: 'email'
    }
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleInputChange = (key: string, value: any) => {
    if (key === 'is_free' && value) {
      setFormData(prev => ({ ...prev, [key]: value, price: 0 }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleContactInfoChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: { ...prev.contact_info, [key]: value }
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images per listing.",
        variant: "destructive"
      });
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `marketplace/${fileName}`;

        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      setImageFiles(prev => [...prev, ...Array.from(files)]);

      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully.`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and category.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const listingData = {
        user_id: userData.user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subject: formData.subject || undefined,
        university: formData.university || undefined,
        price: formData.is_free ? undefined : formData.price,
        is_free: formData.is_free,
        condition: formData.condition || undefined,
        location: formData.location || undefined,
        contact_info: formData.contact_info,
        images: images.length > 0 ? images : undefined,
        status: 'active' as const,
        is_featured: false
      };

      const newListing = await createMarketplaceListing(listingData);

      if (newListing) {
        toast({
          title: "Listing created!",
          description: "Your listing has been submitted and is pending approval."
        });
        onSuccess(newListing);
      } else {
        throw new Error("Failed to create listing");
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create New Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Advanced Mathematics Textbook"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Physics"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  placeholder="e.g., Harvard University"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(cond => (
                      <SelectItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => handleInputChange('is_free', checked)}
                />
                <Label htmlFor="is_free">This is a free giveaway</Label>
              </div>

              {!formData.is_free && (
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <Label>Images (Max 5)</Label>
              <div className="mt-2 space-y-4">
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((url, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {images.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="e.g., Cambridge, MA"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="mt-1 relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.contact_info.email}
                        onChange={(e) => handleContactInfoChange('email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="mt-1 relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        value={formData.contact_info.phone}
                        onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
                  <Select 
                    value={formData.contact_info.preferred_contact} 
                    onValueChange={(value) => handleContactInfoChange('preferred_contact', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select preferred contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImages}
                className="px-8"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateListingForm;
