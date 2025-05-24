
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings, FileText, CreditCard } from 'lucide-react';
import SubscriptionFlow from '@/components/SubscriptionFlow';
import { subscriptionService } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Subscription = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userResponse = await supabase.auth.getUser();
      setUser(userResponse.data.user);

      if (userResponse.data.user) {
        const profile = await subscriptionService.getUserProfile();
        setUserProfile(profile);

        const sub = await subscriptionService.getUserSubscription();
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access subscription features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show subscription flow if user doesn't have an active subscription
  if (!subscription || subscription.status !== 'active') {
    return <SubscriptionFlow />;
  }

  // Show subscription management for active subscribers
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your CritiScan ICU AI subscription</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Subscription Tier:</span>
                <Badge variant="default">{userProfile?.subscription_tier}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Verification Status:</span>
                <Badge variant={userProfile?.verification_status === 'approved' ? 'default' : 'secondary'}>
                  {userProfile?.verification_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{subscription.subscription_period}</span>
              </div>
              <div className="flex justify-between">
                <span>Next Billing:</span>
                <span className="font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button onClick={handleManageSubscription} size="lg" className="mr-4">
            <Settings className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
          
          <p className="text-sm text-gray-600">
            Use the customer portal to update payment methods, view invoices, or cancel your subscription.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">Important Information</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Your subscription auto-renews every {subscription.subscription_period === 'monthly' ? '30 days' : '365 days'}</p>
            <p>• You can cancel anytime and retain access until your current period ends</p>
            <p>• Failed payments will be retried once before access is suspended</p>
            <p>• Contact support if you need assistance with your subscription</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
