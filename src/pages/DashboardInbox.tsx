
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, User } from 'lucide-react';

const DashboardInbox = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  const messages = [
    {
      id: 1,
      sender: "Admin",
      subject: "Welcome to EduHub Nepal",
      content: "Welcome to our platform! We're excited to have you join our community of learners.",
      time: "2024-01-20 10:30",
      read: true
    },
    {
      id: 2,
      sender: "Study Group",
      subject: "Physics Study Session Tomorrow",
      content: "Don't forget about our physics study session tomorrow at 3 PM. We'll be covering thermodynamics.",
      time: "2024-01-19 15:45",
      read: false
    },
    {
      id: 3,
      sender: "System",
      subject: "Your material was approved",
      content: "Your uploaded study material 'Organic Chemistry Notes' has been approved and is now live!",
      time: "2024-01-18 09:15",
      read: true
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages & Inbox</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
                <Badge variant="secondary">{messages.filter(m => !m.read).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    } ${!message.read ? 'bg-blue-25 border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{message.sender}</span>
                      {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                    <p className="text-sm font-medium mb-1">{message.subject}</p>
                    <p className="text-xs text-gray-500">{message.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6" />
                  <div>
                    <CardTitle>{selectedMessage.sender}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
                    <p className="text-xs text-gray-500">{selectedMessage.time}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{selectedMessage.content}</p>
                </div>

                {/* Reply Section */}
                <div className="space-y-3">
                  <h4 className="font-medium">Reply</h4>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                  <Button className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Send Reply</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a message to read</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose New Message */}
      <Card>
        <CardHeader>
          <CardTitle>Compose New Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="To: (recipient)" />
          <Input placeholder="Subject" />
          <Textarea placeholder="Type your message here..." rows={4} />
          <Button className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Send Message</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardInbox;
