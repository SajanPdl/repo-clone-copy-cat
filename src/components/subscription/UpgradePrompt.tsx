
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  feature?: string;
  className?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature = "premium features", 
  className = "" 
}) => {
  const navigate = useNavigate();
  const { hasActiveSubscription, isPremiumUser } = useSubscription();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  // Don't show if user already has premium
  if (isPremiumUser()) {
    return null;
  }

  return (
    <Card className={`border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Crown className="h-5 w-5" />
          Upgrade to Pro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-700">
            Unlock {feature} and get access to all premium content with a Pro subscription.
          </p>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Unlimited downloads</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Priority support</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Exclusive content</span>
          </div>
          
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Upgrade Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
