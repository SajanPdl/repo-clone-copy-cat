
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  Check, 
  X, 
  Clock,
  FileText,
  User,
  CreditCard,
  Loader2
} from 'lucide-react';

const PaymentVerificationManager = () => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_verifications')
        .select(`
          *,
          order:orders(
            *,
            buyer:users!buyer_id(email),
            seller:users!seller_id(email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error loading verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment verifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (verificationId: string, status: 'approved' | 'rejected') => {
    setProcessing(verificationId);
    
    try {
      // Update verification status
      const { error: updateError } = await supabase
        .from('payment_verifications')
        .update({
          status,
          admin_notes: adminNotes[verificationId] || null,
          verified_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (updateError) throw updateError;

      if (status === 'approved') {
        // Process the order payment using the database function
        const verification = verifications.find(v => v.id === verificationId);
        if (verification?.order?.id) {
          const { error: processError } = await supabase.rpc('process_order_payment', {
            p_order_id: verification.order.id,
            p_admin_id: (await supabase.auth.getUser()).data.user?.id
          });

          if (processError) throw processError;
        }
      }

      toast({
        title: status === 'approved' ? 'Payment approved!' : 'Payment rejected',
        description: `Payment verification has been ${status}.`
      });

      loadVerifications();
      setAdminNotes(prev => ({ ...prev, [verificationId]: '' }));
    } catch (error) {
      console.error('Error processing verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment verification',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const viewReceipt = (filePath: string) => {
    if (filePath) {
      const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
      window.open(data.publicUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Verifications</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {verifications.filter(v => v.status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {verifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No payment verifications</h3>
              <p className="text-gray-600">Payment verifications will appear here when submitted.</p>
            </CardContent>
          </Card>
        ) : (
          verifications.map((verification) => (
            <Card key={verification.id} className={verification.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Payment Verification
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Order ID: {verification.order?.id?.slice(-8)}
                    </p>
                  </div>
                  {getStatusBadge(verification.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Buyer Information
                    </h4>
                    <p className="text-sm">{verification.order?.buyer?.email}</p>
                    <p className="text-sm font-mono">Amount: NPR {verification.payment_amount}</p>
                    {verification.esewa_transaction_id && (
                      <p className="text-sm">
                        Transaction ID: <span className="font-mono">{verification.esewa_transaction_id}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Order Details</h4>
                    <p className="text-sm">Item: {verification.order?.item_type?.replace('_', ' ')}</p>
                    <p className="text-sm">Order Amount: NPR {verification.order?.amount}</p>
                    <p className="text-sm">
                      Date: {new Date(verification.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Receipt</h4>
                    {verification.receipt_file_path ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewReceipt(verification.receipt_file_path)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Receipt
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-500">No receipt uploaded</p>
                    )}
                  </div>
                </div>

                {verification.status === 'pending' && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Notes</label>
                      <Textarea
                        value={adminNotes[verification.id] || ''}
                        onChange={(e) => setAdminNotes(prev => ({ ...prev, [verification.id]: e.target.value }))}
                        placeholder="Optional notes for this verification..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVerification(verification.id, 'approved')}
                        disabled={processing === verification.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing === verification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Approve Payment
                      </Button>
                      <Button
                        onClick={() => handleVerification(verification.id, 'rejected')}
                        disabled={processing === verification.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processing === verification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Reject Payment
                      </Button>
                    </div>
                  </div>
                )}

                {verification.status !== 'pending' && verification.admin_notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Admin Notes</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded">{verification.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentVerificationManager;
