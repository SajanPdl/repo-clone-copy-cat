import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, Plus, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const MarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [listings, setListings] = useState([
    {
      id: '1',
      title: 'Mathematics Textbook - Grade 10',
      description: 'Gives a comprehensive overview of all topics prescribed by the curriculum.',
      price: 500,
      isNegotiable: true,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1589829277958-4237cb91ade9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGV4dGJvb2tzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      category: 'Textbooks',
      condition: 'New',
      sellerInfo: {
        name: 'Sandesh Bhattarai',
        location: 'Bhaktapur'
      }
    },
    {
      id: '2',
      title: 'Physics Practical Copy - Class 12',
      description: 'Well maintained practical copy with all experiments completed.',
      price: 300,
      isNegotiable: false,
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1628155944357-5849934954bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvcHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      category: 'Lab Materials',
      condition: 'Used',
      sellerInfo: {
        name: 'Kusum Shrestha',
        location: 'Kathmandu'
      }
    },
    {
      id: '3',
      title: 'Accountancy Notes - BBA 2nd Sem',
      description: 'Comprehensive notes covering all important topics with solved examples.',
      price: 400,
      isNegotiable: true,
      isAvailable: false,
      imageUrl: 'https://images.unsplash.com/photo-1503758772605-9473a5977f48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bm90ZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      category: 'Notes',
      condition: 'Like New',
      sellerInfo: {
        name: 'Ayush Maharjan',
        location: 'Lalitpur'
      }
    },
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: 0,
    isNegotiable: false,
    isAvailable: true,
    imageUrl: '',
    category: '',
    condition: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewListing(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateListing = () => {
    setShowCreateForm(true);
  };

  const handleSubmitListing = () => {
    if (!newListing.title || !newListing.description || !newListing.price || !newListing.category || !newListing.condition) {
      toast({
        title: "Error",
        description: "Please fill in all the fields.",
        variant: "destructive"
      });
      return;
    }

    const newId = Math.random().toString(36).substring(2, 15);
    const listingToAdd = {
      ...newListing,
      id: newId,
      sellerInfo: {
        name: user?.email || 'Unknown',
        location: 'Unknown'
      }
    };

    setListings(prev => [...prev, listingToAdd]);
    setNewListing({
      title: '',
      description: '',
      price: 0,
      isNegotiable: false,
      isAvailable: true,
      imageUrl: '',
      category: '',
      condition: '',
    });
    setShowCreateForm(false);
    toast({
      title: "Success",
      description: "Your listing has been created successfully."
    });
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Button onClick={handleCreateListing}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Listing
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          <Card key={listing.id}>
            <CardHeader>
              <CardTitle>{listing.title}</CardTitle>
              <CardDescription>
                {listing.sellerInfo.name} - {listing.sellerInfo.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <img src={listing.imageUrl} alt={listing.title} className="rounded-md aspect-video object-cover mb-3" />
              <p className="text-gray-700">{listing.description}</p>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">Rs. {listing.price}</div>
                {listing.isNegotiable && (
                  <span className="text-sm text-gray-500">Negotiable</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Condition: {listing.condition}</span>
                {!listing.isAvailable && (
                  <span className="text-sm text-red-500">Sold Out</span>
                )}
              </div>
              <Button variant="outline">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Listing Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Create a New Listing</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input type="text" id="title" name="title" value={newListing.title} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={newListing.description} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input type="number" id="price" name="price" value={newListing.price} onChange={handleInputChange} />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isNegotiable">Negotiable</Label>
                  <Switch id="isNegotiable" name="isNegotiable" checked={newListing.isNegotiable} onCheckedChange={(checked) => handleInputChange({ target: { name: 'isNegotiable', type: 'checkbox', checked } })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input type="text" id="imageUrl" name="imageUrl" value={newListing.imageUrl} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input type="text" id="category" name="category" value={newListing.category} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Input type="text" id="condition" name="condition" value={newListing.condition} onChange={handleInputChange} />
                </div>
                <Button onClick={handleSubmitListing}>Submit Listing</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
