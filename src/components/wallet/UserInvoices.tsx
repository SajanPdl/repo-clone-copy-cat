import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Invoice {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  items: any[];
  due_date?: string;
  paid_at?: string;
  created_at: string;
}
  import type { Database } from '@/integrations/supabase/types';

const UserInvoices: React.FC = () => {
  const { user } = useAuth();
  type InvoiceRow = import('@/integrations/supabase/types').Database['public']['Tables']['invoices']['Row'];
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    setLoading(true);
    if (!user?.id) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setInvoices(data as InvoiceRow[]);
    else setInvoices([]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No invoices found</div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Amount: Rs. {Number(inv.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(inv.created_at).toLocaleString()}</p>
                    {inv.due_date && <p className="text-xs text-gray-500">Due: {new Date(inv.due_date).toLocaleDateString()}</p>}
                    {inv.paid_at && <p className="text-xs text-gray-500">Paid: {new Date(inv.paid_at).toLocaleString()}</p>}
                    <p className="text-xs text-gray-500">Items: {Array.isArray(inv.items) ? inv.items.length : 0}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'cancelled' ? 'destructive' : 'secondary'}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInvoices;
