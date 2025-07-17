
import React, { useState } from 'react';
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
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store subscription info in localStorage
      localStorage.setItem('userSubscription', 'premium');
      localStorage.setItem('subscriptionExpires', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      
      toast.success("Subscription successful! You now have premium access.");
      setOpenDialog(false);
      
      // Force a page reload to apply premium status
      window.location.reload();
      
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  // Check if user has premium subscription
  const userSubscription = localStorage.getItem('userSubscription');
  const isPremium = userSubscription === 'premium';
  
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
                  plan.name === "Premium" 
                    ? "bg-gradient-to-r from-[#DC143C] to-[#003893] hover:opacity-90"
                    : ""
                }`}
                variant={plan.name === "Free" ? "outline" : "default"}
                disabled={(plan.name === "Free" && !isPremium) || (plan.name === "Premium" && isPremium)}
                onClick={() => {
                  if (plan.name === "Premium" && !isPremium) {
                    handleOpenDialog(plan);
                  }
                }}
              >
                {isPremium && plan.name === "Premium" ? "Current Plan" : plan.buttonText}
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
          
          <div className="py-4">
            <div className="mb-6">
              <h3 className="font-medium mb-2">Plan: {selectedPlan?.name}</h3>
              <p className="text-2xl font-bold">Rs. {selectedPlan?.price}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span></p>
            </div>
            
            <Tabs defaultValue="esewa" onValueChange={(value) => setPaymentMethod(value as 'esewa' | 'khalti')}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="esewa">eSewa</TabsTrigger>
                <TabsTrigger value="khalti">Khalti</TabsTrigger>
              </TabsList>
              
              <TabsContent value="esewa">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Pay with eSewa</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fast and secure payment</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">eSewa ID</label>
                      <input 
                        type="text" 
                        placeholder="Enter your eSewa ID" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium block mb-1">eSewa Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter your password" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="khalti">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Pay with Khalti</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quick and reliable transactions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">Khalti Mobile Number</label>
                      <input 
                        type="tel" 
                        placeholder="98XXXXXXXX" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium block mb-1">Khalti MPIN</label>
                      <input 
                        type="password" 
                        placeholder="Enter your MPIN" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center mt-2">
              <Bell className="h-4 w-4 text-amber-500 mr-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You will be charged Rs. {selectedPlan?.price} for 1 month of premium access.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              className="bg-gradient-to-r from-[#DC143C] to-[#003893] hover:opacity-90"
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin mr-2"></div>
                  Processing
                </>
              ) : (
                `Pay Rs. ${selectedPlan?.price}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumSubscription;
