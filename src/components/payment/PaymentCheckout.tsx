
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, CreditCard, QrCode, FileText, Loader2 } from 'lucide-react';
import { getSiteSettings, uploadPaymentReceipt } from '@/utils/paymentUtils';
import type { Order } from '@/utils/paymentUtils';

interface PaymentCheckoutProps {
  order: Order;
  onPaymentSubmitted: () => void;
}

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({ order, onPaymentSubmitted }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const siteSettings = await getSiteSettings();
      setSettings(siteSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload JPG, PNG, or PDF files only.',
          variant: 'destructive'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload files smaller than 5MB.',
          variant: 'destructive'
        });
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!receiptFile || !transactionId.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please upload receipt and enter transaction ID.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      await uploadPaymentReceipt(
        order.id,
        receiptFile,
        order.amount,
        transactionId.trim()
      );

      toast({
        title: 'Payment submitted!',
        description: 'Your payment receipt has been submitted for verification.'
      });

      onPaymentSubmitted();
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CreditCard className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order ID:</span>
              <Badge variant="outline" className="font-mono">{order.id.slice(-8)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="text-2xl font-bold text-green-600">NPR {order.amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Item Type:</span>
              <Badge>{order.item_type.replace('_', ' ')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Step 1: Make Payment via eSewa</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-medium">eSewa ID:</span>
                <Badge variant="secondary" className="font-mono text-lg">
                  {settings?.admin_esewa_id || '9876543210'}
                </Badge>
              </div>
              <div className="text-sm text-yellow-700">
                <p>• Send <strong>NPR {order.amount}</strong> to the above eSewa ID</p>
                <p>• Use "Education Platform Purchase" as payment description</p>
                <p>• Take a screenshot of your payment confirmation</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Step 2: Upload Payment Receipt</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="receipt" className="font-medium">Payment Receipt*</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors mt-2">
                  <input
                    type="file"
                    id="receipt"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="receipt" className="cursor-pointer">
                    {receiptFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FileText className="h-6 w-6" />
                        <span className="font-medium">{receiptFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p>Click to upload payment screenshot</p>
                        <p className="text-xs">JPG, PNG, or PDF (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="transactionId" className="font-medium">eSewa Transaction ID*</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter eSewa transaction ID"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitPayment}
            disabled={!receiptFile || !transactionId.trim() || uploading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Payment...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Payment for Verification
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>Your payment will be verified within 24 hours.</p>
            <p>You will receive a notification once approved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCheckout;
