
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentRequest {
  id: string;
  plan_type: string;
  amount: number;
  sender_name: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  verified_at?: string;
  admin_notes?: string;
}

const PaymentStatusPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPaymentRequests();
    }
  }, [user]);

  const fetchPaymentRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedRequests = (data || []).map((item: any): PaymentRequest => ({
        id: item.id,
        plan_type: item.plan_type,
        amount: Number(item.amount),
        sender_name: item.sender_name || '',
        transaction_id: item.transaction_id || '',
        status: item.status as 'pending' | 'approved' | 'rejected',
        created_at: item.created_at,
        verified_at: item.verified_at,
        admin_notes: item.admin_notes
      }));

      setRequests(transformedRequests);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CreditCard className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold">Payment Status</h1>
          <p className="text-gray-600 mt-2">Track your subscription payment requests</p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Requests</h3>
              <p className="text-gray-600 mb-6">You haven't made any payment requests yet.</p>
              <Link to="/premium">
                <Button>Browse Plans</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span>Payment Request #{request.id.slice(-8)}</span>
                    </CardTitle>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Plan Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Plan: {request.plan_type}</p>
                        <p>Amount: NPR {request.amount}</p>
                        <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                        {request.verified_at && (
                          <p>Processed: {new Date(request.verified_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Payment Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Sender: {request.sender_name}</p>
                        <p>Transaction ID: {request.transaction_id}</p>
                      </div>
                    </div>
                  </div>

                  {request.admin_notes && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {request.admin_notes}
                      </p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Payment Under Review</h4>
                        <p className="text-sm text-blue-800">
                          Your payment request is being verified by our team. This usually takes 24-48 hours. 
                          You'll receive a notification once it's processed.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
