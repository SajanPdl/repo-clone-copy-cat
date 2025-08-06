
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, MessageSquare, Clock } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'received' | 'sent';
}

const DashboardInbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    // Load demo messages for now
    setMessages([
      {
        id: '1',
        sender: 'Admin',
        subject: 'Welcome to EduHub Nepal',
        content: 'Welcome to EduHub Nepal! We are excited to have you as part of our learning community.',
        timestamp: '2024-01-15T10:00:00Z',
        read: false,
        type: 'received'
      },
      {
        id: '2',
        sender: 'Study Group',
        subject: 'Physics Assignment Discussion',
        content: 'Hey! Can we schedule a meeting to discuss the physics assignment? I have some questions about Chapter 5.',
        timestamp: '2024-01-14T15:30:00Z',
        read: true,
        type: 'received'
      }
    ]);
  }, []);

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toISOString(),
      read: true,
      type: 'sent'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({ to: '', subject: '', content: '' });
    setShowCompose(false);
    
    toast({
      title: 'Success',
      description: 'Message sent successfully'
    });
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read && message.type === 'received') {
      setMessages(prev =>
        prev.map(m => m.id === message.id ? { ...m, read: true } : m)
      );
    }
  };

  const unreadCount = messages.filter(m => !m.read && m.type === 'received').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    Messages
                  </h1>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                  )}
                </div>
                <Button onClick={() => setShowCompose(!showCompose)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </div>
            </header>

            <main className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                {/* Messages List */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Compose Form */}
                  {showCompose && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">New Message</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          placeholder="To"
                          value={newMessage.to}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, to: e.target.value }))}
                        />
                        <Input
                          placeholder="Subject"
                          value={newMessage.subject}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                        />
                        <Textarea
                          placeholder="Message content"
                          value={newMessage.content}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSendMessage} size="sm">
                            Send
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowCompose(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Messages List */}
                  <div className="space-y-2 overflow-y-auto max-h-96">
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((message) => (
                        <Card
                          key={message.id}
                          className={`cursor-pointer transition-colors ${
                            selectedMessage?.id === message.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                          } ${!message.read && message.type === 'received' ? 'border-l-4 border-l-blue-500' : ''}`}
                          onClick={() => handleMessageClick(message)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {message.sender.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm ${!message.read && message.type === 'received' ? 'font-semibold' : ''}`}>
                                    {message.sender}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    {message.type === 'sent' && (
                                      <Badge variant="outline" className="text-xs">Sent</Badge>
                                    )}
                                    <Clock className="h-3 w-3 text-gray-400" />
                                  </div>
                                </div>
                                <p className={`text-sm truncate ${!message.read && message.type === 'received' ? 'font-medium' : 'text-gray-600'}`}>
                                  {message.subject}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {message.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(message.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No messages found
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="lg:col-span-2">
                  {selectedMessage ? (
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{selectedMessage.subject}</CardTitle>
                            <div className="flex items-center space-x-2 mt-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {selectedMessage.sender.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">
                                From: {selectedMessage.sender}
                              </span>
                              <Badge variant={selectedMessage.type === 'sent' ? 'outline' : 'secondary'}>
                                {selectedMessage.type === 'sent' ? 'Sent' : 'Received'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(selectedMessage.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedMessage.content}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Select a message to view its content</p>
                      </div>
                    </div>
                  )}
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
