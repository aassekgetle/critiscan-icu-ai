
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, FileText, User } from 'lucide-react';
import SubscriptionPlans from './SubscriptionPlans';
import DocumentUpload from './DocumentUpload';
import { SubscriptionTier, subscriptionService } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type FlowStep = 'plan-selection' | 'document-upload' | 'payment' | 'verification';

const SubscriptionFlow = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('plan-selection');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await subscriptionService.getUserProfile();
      setUserProfile(profile);
      
      // Check if user already has documents uploaded or is verified
      if (profile.verification_status === 'approved') {
        setCurrentStep('payment');
      } else if (profile.subscription_tier) {
        setCurrentStep('document-upload');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handlePlanSelection = async (tier: SubscriptionTier, period: 'monthly' | 'yearly') => {
    setSelectedTier(tier);
    setSelectedPeriod(period);
    
    try {
      await subscriptionService.updateProfile({ 
        subscription_tier: tier.id 
      });
      setCurrentStep('document-upload');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan selection.",
        variant: "destructive"
      });
    }
  };

  const handleDocumentUploadComplete = () => {
    setCurrentStep('verification');
  };

  const handlePayment = async () => {
    if (!selectedTier) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier: selectedTier.id,
          period: selectedPeriod,
          price: selectedPeriod === 'monthly' ? selectedTier.monthlyPrice : selectedTier.yearlyPrice
        }
      });

      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create checkout session.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'plan-selection', label: 'Select Plan', icon: User },
      { id: 'document-upload', label: 'Upload Documents', icon: FileText },
      { id: 'verification', label: 'Verification', icon: CheckCircle },
      { id: 'payment', label: 'Payment', icon: CreditCard }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-8 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderStepIndicator()}
      
      {currentStep === 'plan-selection' && (
        <SubscriptionPlans
          onSelectPlan={handlePlanSelection}
          selectedTier={selectedTier?.id}
          selectedPeriod={selectedPeriod}
        />
      )}

      {currentStep === 'document-upload' && selectedTier && (
        <DocumentUpload
          selectedTier={selectedTier}
          onUploadComplete={handleDocumentUploadComplete}
        />
      )}

      {currentStep === 'verification' && (
        <Card className="w-full max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 mr-2 text-blue-600" />
              Documents Under Review
            </CardTitle>
            <CardDescription>
              Your documents are being verified by our team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="secondary" className="text-base px-4 py-2">
              Verification Status: {userProfile?.verification_status || 'Pending'}
            </Badge>
            <p className="text-gray-600">
              We're reviewing your uploaded documents. This typically takes 1-2 business days.
              You'll receive an email notification once verification is complete.
            </p>
            {userProfile?.verification_status === 'approved' && (
              <Button onClick={() => setCurrentStep('payment')} size="lg">
                Proceed to Payment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'payment' && selectedTier && (
        <Card className="w-full max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Complete Your Subscription
            </CardTitle>
            <CardDescription>
              Finalize your {selectedTier.name} subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{selectedTier.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing:</span>
                <span className="font-medium">{selectedPeriod}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>
                  ${selectedPeriod === 'monthly' ? selectedTier.monthlyPrice : selectedTier.yearlyPrice}
                  /{selectedPeriod === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handlePayment} 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Checkout...' : 'Pay with 2Checkout'}
            </Button>
            
            <p className="text-xs text-gray-500">
              Payment processed securely by 2Checkout (Verifone). Accepted methods: Visa, Mastercard, PayPal, and more
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionFlow;
