
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Mail, 
  MailOpen, 
  Trash2, 
  Search, 
  Filter,
  ChevronLeft,
  Clock
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { StudentSidebar } from '@/components/StudentSidebar';
import { 
  Message, 
  fetchUserMessages, 
  markMessageAsRead, 
  deleteMessage 
} from '@/utils/messagingUtils';
import { useToast } from '@/hooks/use-toast';

const DashboardInbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      const data = await fetchUserMessages(user.id);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    
    if (!message.is_read) {
      try {
        await markMessageAsRead(message.id);
        setMessages(prev => 
          prev.map(m => 
            m.id === message.id ? { ...m, is_read: true } : m
          )
        );
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      toast({
        title: 'Success',
        description: 'Message deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterUnread || !message.is_read;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </div>
            </header>
            <main className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Messages List */}
                <div className="lg:col-span-1">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Inbox
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterUnread(!filterUnread)}
                          className={filterUnread ? 'bg-blue-100' : ''}
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search messages..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </CardHeader>
                    <Separator />
                    <ScrollArea className="h-[calc(100%-120px)]">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading messages...
                        </div>
                      ) : filteredMessages.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No messages found
                        </div>
                      ) : (
                        <div className="space-y-1 p-2">
                          {filteredMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedMessage?.id === message.id
                                  ? 'bg-blue-100 border-blue-200'
                                  : message.is_read
                                  ? 'hover:bg-gray-100'
                                  : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                              }`}
                              onClick={() => handleMessageClick(message)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {message.is_read ? (
                                    <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  ) : (
                                    <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-sm truncate ${
                                      message.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'
                                    }`}>
                                      {message.subject}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      From: {message.sender_profile?.email || 'System'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </Card>
                </div>

                {/* Message Details */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    {selectedMessage ? (
                      <>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMessage(null)}
                                className="lg:hidden"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {selectedMessage.subject}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  From: {selectedMessage.sender_profile?.email || 'System'} • {' '}
                                  {new Date(selectedMessage.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(selectedMessage.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-6">
                          <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700">
                              {selectedMessage.message}
                            </div>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Select a message</p>
                          <p className="text-sm">Choose a message from the list to read</p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardInbox;
