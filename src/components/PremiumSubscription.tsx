
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, X, CreditCard, Bell } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/useSubscription';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
  color?: string;
}

export const PremiumSubscription = () => {
  const navigate = useNavigate();
  const { userSubscription, isPremiumUser, loading: subLoading } = useSubscription();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti'>('esewa');
  const [processing, setProcessing] = useState(false);
  
  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: 0,
      description: "Basic access to educational resources",
      features: [
        { name: "Basic study materials", included: true },
        { name: "Limited past papers", included: true },
        { name: "Ad-supported experience", included: true },
        { name: "Community forum access", included: true },
        { name: "Download limit: 5 per day", included: true },
        { name: "Ad-free experience", included: false },
        { name: "Premium study materials", included: false },
        { name: "Full access to past papers", included: false },
      ],
      buttonText: "Current Plan",
      color: "gray"
    },
    {
      name: "Premium",
      price: 599,
      description: "Full access to all resources",
      features: [
        { name: "Basic study materials", included: true },
        { name: "Limited past papers", included: true },
        { name: "Ad-supported experience", included: true },
        { name: "Community forum access", included: true },
        { name: "Unlimited downloads", included: true },
        { name: "Ad-free experience", included: true },
        { name: "Premium study materials", included: true },
        { name: "Full access to past papers", included: true },
      ],
      buttonText: "Upgrade Now",
      popular: true,
      color: "#003893"
    }
  ];
  
  const handleOpenDialog = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setOpenDialog(true);
  };
  
  const handlePurchase = async () => {
    if (!selectedPlan) return;
    
    setProcessing(true);
    
    try {
      // Redirect to subscription workflow page
      navigate('/subscription');
      setOpenDialog(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  const handleUpgradeClick = () => {
    navigate('/subscription');
  };
  
  const isPremium = isPremiumUser();
  
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get access to premium educational resources to excel in your studies. Choose the plan that best fits your needs.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`relative overflow-hidden ${
              plan.popular 
                ? "border-2 border-[#003893] shadow-lg" 
                : "border border-gray-200 dark:border-gray-700"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-[#003893] text-white text-xs font-bold py-1 px-3 transform translate-x-6 translate-y-3 rotate-45">
                  Popular
                </div>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className={`text-2xl ${plan.color ? `text-[${plan.color}]` : ""}`}>
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 mb-6">
                <span className="text-3xl font-bold">Rs. {plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${!feature.included ? "text-gray-500 dark:text-gray-400" : ""}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  plan.name === 'Premium'
                    ? 'bg-gradient-to-r from-[#DC143C] to-[#003893] hover:opacity-90'
                    : ''
                }`}
                variant={plan.name === 'Free' ? 'outline' : 'default'}
                disabled={(plan.name === 'Free' && !isPremium) || (plan.name === 'Premium' && isPremium)}
                onClick={() => {
                  if (plan.name === 'Premium' && !isPremium) {
                    handleUpgradeClick();
                  }
                }}
              >
                {isPremium && plan.name === 'Premium' ? 'Current Plan' : plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Complete your subscription to unlock premium features
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'esewa' | 'khalti')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="esewa">eSewa</TabsTrigger>
              <TabsTrigger value="khalti">Khalti</TabsTrigger>
            </TabsList>
            
            <TabsContent value="esewa" className="space-y-4">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-600">
                  Pay securely with eSewa digital wallet
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="khalti" className="space-y-4">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                <p className="text-sm text-gray-600">
                  Pay securely with Khalti digital wallet
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={processing}
              className="bg-gradient-to-r from-[#DC143C] to-[#003893] hover:opacity-90"
            >
              {processing ? "Processing..." : `Pay Rs. ${selectedPlan?.price}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumSubscription;
