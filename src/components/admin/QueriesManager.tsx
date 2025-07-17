
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MessageSquare, 
  CheckCircle,
  Circle,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Tables } from '@/integrations/supabase/types';

type UserQuery = Tables<'user_queries'>;

const QueriesManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedQuery, setSelectedQuery] = useState<UserQuery | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  const { data: queries, isLoading, isError, refetch } = useQuery({
    queryKey: ['user_queries', { status: statusFilter, search: searchTerm }],
    queryFn: async () => {
      let query = supabase
        .from('user_queries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter && statusFilter !== 'All') {
        query = query.eq('status', statusFilter);
      }
      
      if (searchTerm) {
        query = query.or(`query_text.ilike.%${searchTerm}%,user_name.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
  
  const handleReplyClick = (query: UserQuery) => {
    setSelectedQuery(query);
    setReplyText('');
    setIsDialogOpen(true);
  };
  
  const handleCloseQuery = async (id: number) => {
    try {
      const { error } = await supabase
        .from('user_queries')
        .update({ 
          status: 'Closed',
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Query closed",
        description: "The query has been marked as resolved.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close query. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Reply cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedQuery) return;
    
    try {
      // In a real application, you would send an email to the user
      // For this demo, we'll just mark the query as closed
      const { error } = await supabase
        .from('user_queries')
        .update({ 
          status: 'Closed',
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedQuery.id);
      
      if (error) throw error;
      
      toast({
        title: "Reply sent",
        description: `Your reply has been sent to ${selectedQuery.user_name}.`,
      });
      
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search queries..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              className="bg-white border border-gray-200 rounded p-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-1">
          <CardTitle>User Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading queries...</p>
            </div>
          ) : isError ? (
            <div className="py-10 text-center">
              <p className="text-red-500">Error loading queries.</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Query</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Date <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries?.length ? (
                  queries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="line-clamp-1">{query.query_text}</span>
                        </div>
                      </TableCell>
                      <TableCell>{query.user_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {query.status === 'Open' ? (
                            <Circle className="h-4 w-4 text-red-500 fill-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span>{query.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{query.created_at ? new Date(query.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {query.status === 'Open' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleReplyClick(query)}
                              >
                                Reply
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCloseQuery(query.id)}
                              >
                                Close
                              </Button>
                            </>
                          )}
                          {query.status === 'Closed' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleReplyClick(query)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      No queries found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedQuery?.status === 'Open' ? 'Reply to Query' : 'Query Details'}</DialogTitle>
            <DialogDescription>
              From: {selectedQuery?.user_name} ({selectedQuery?.email || 'No email provided'})
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-gray-50 rounded-md my-4">
            <p className="text-sm">{selectedQuery?.query_text}</p>
            <p className="text-xs text-gray-500 mt-2">
              Submitted on {selectedQuery?.created_at && new Date(selectedQuery.created_at).toLocaleString()}
            </p>
          </div>
          
          {selectedQuery?.status === 'Open' && (
            <>
              <Textarea
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
              
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSendReply}>
                  Send Reply
                </Button>
              </DialogFooter>
            </>
          )}
          
          {selectedQuery?.status === 'Closed' && (
            <DialogFooter className="sm:justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QueriesManager;
