
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  BookOpen,
  Lightbulb,
  Calculator,
  Globe
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { StudentSidebar } from '@/components/StudentSidebar';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistantPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // For now, provide a mock AI response until the edge function is set up
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${userMessage.content}". This is a demonstration of the AI assistant functionality. The system is designed to help students with:

• Study questions and explanations
• Problem-solving assistance
• Research guidance
• Academic planning

To enable full AI functionality, please ensure the OpenAI API key is configured in the edge functions settings.`,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    { icon: BookOpen, text: "Explain photosynthesis", category: "Science" },
    { icon: Calculator, text: "Solve quadratic equations", category: "Math" },
    { icon: Globe, text: "Nepal's history overview", category: "Social" },
    { icon: Lightbulb, text: "Study tips for exams", category: "General" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <div className="flex">
        <StudentSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bot className="h-8 w-8 text-blue-600" />
                AI Study Assistant
              </h1>
              <p className="text-gray-600 mt-2">
                Get instant help with your studies, homework, and academic questions
              </p>
            </div>

            <Card className="h-[calc(100vh-250px)] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>Chat with AI Assistant</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Bot className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Welcome to AI Study Assistant
                    </h3>
                    <p className="text-gray-500 text-center mb-6">
                      Ask me anything about your studies. I can help with explanations, 
                      problem-solving, and study guidance.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center gap-2"
                          onClick={() => setInputMessage(prompt.text)}
                        >
                          <prompt.icon className="h-5 w-5 text-blue-600" />
                          <span className="text-xs font-medium">{prompt.category}</span>
                          <span className="text-xs text-gray-600 text-center">
                            {prompt.text}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white ml-auto'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-2 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          
                          {message.role === 'user' && (
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-gray-600">AI is thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                )}

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything about your studies..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIAssistantPage;
