
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, FileText, Clock } from 'lucide-react';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlansProps {
  onSelectPlan: (tier: SubscriptionTier, period: 'monthly' | 'yearly') => void;
  selectedTier?: string;
  selectedPeriod?: 'monthly' | 'yearly';
}

const SubscriptionPlans = ({ onSelectPlan, selectedTier, selectedPeriod }: SubscriptionPlansProps) => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>(selectedPeriod || 'monthly');

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to select a subscription plan.",
        variant: "destructive"
      });
      return;
    }

    onSelectPlan(tier, period);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Subscription Plan</h2>
        <p className="text-gray-600">
          Role-based pricing with verification requirements. All plans auto-renew until canceled.
        </p>
      </div>

      <div className="flex justify-center">
        <RadioGroup
          value={period}
          onValueChange={(value: 'monthly' | 'yearly') => setPeriod(value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly" className="text-lg font-medium">
              Monthly Plans
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly" className="text-lg font-medium">
              Yearly Plans
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const price = period === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
          const isSelected = selectedTier === tier.id && selectedPeriod === period;
          
          return (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription className="text-sm">{tier.description}</CardDescription>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">${price}</div>
                  <div className="text-sm text-gray-500">
                    {period === 'monthly' ? 'every 30 days, auto-renews' : 'every 365 days, auto-renews'}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Verification Required:
                  </h4>
                  <ul className="text-sm space-y-1">
                    {tier.requirements.map((req, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Billing Terms:
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>• Auto-renewal every {period === 'monthly' ? '30 days' : '365 days'}</p>
                    <p>• Cancel anytime</p>
                    <p>• Access until period ends</p>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSelectPlan(tier)}
                  className="w-full"
                  variant={isSelected ? "default" : "outline"}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </Button>

                {isSelected && (
                  <Badge className="absolute top-4 right-4" variant="default">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Payment Information</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• Accepted payment methods: Visa, Mastercard, Skrill, and Neteller</p>
          <p>• No trials or discounts available</p>
          <p>• Failed payments will be retried once before access is revoked</p>
          <p>• Full repayment required to reactivate after suspension</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
