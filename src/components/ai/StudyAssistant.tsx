
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Send, BookOpen, Brain, FileQuestion, History, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StudySession {
  id: string;
  title: string;
  subject: string;
  messages: ChatMessage[];
  created_at: string;
}

const StudyAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [mode, setMode] = useState<'chat' | 'explain' | 'quiz' | 'flashcard'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      startNewSession();
    }
  }, [user, mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          mode
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    setMessages([]);
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(mode),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const getWelcomeMessage = (currentMode: string) => {
    const messages = {
      chat: "Hi! I'm your AI study assistant. Ask me anything about your studies, and I'll help explain concepts, solve problems, or provide guidance.",
      explain: "I'm here to explain complex topics in simple terms. Share a topic or concept you'd like me to break down for you.",
      quiz: "Let's test your knowledge! Tell me what subject or topic you'd like to be quizzed on, and I'll create questions for you.",
      flashcard: "I can help create flashcards for your studies. Share the topic or material you want to create flashcards for."
    };
    return messages[currentMode as keyof typeof messages] || messages.chat;
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as typeof mode);
    startNewSession();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickPrompts = {
    chat: [
      "Explain this concept to me",
      "Help me solve this problem",
      "What are the key points?",
      "Can you give me examples?"
    ],
    explain: [
      "Explain quantum physics",
      "How does photosynthesis work?",
      "What is machine learning?",
      "Explain the water cycle"
    ],
    quiz: [
      "Quiz me on mathematics",
      "Test my biology knowledge",
      "History quiz please",
      "Chemistry questions"
    ],
    flashcard: [
      "Create flashcards for physics formulas",
      "Make cards for vocabulary",
      "Flashcards for historical dates",
      "Chemistry element cards"
    ]
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">AI Study Assistant</h1>
              <p className="text-gray-600">Your personal AI tutor powered by OpenAI</p>
            </div>
          </div>
          <Button onClick={startNewSession} variant="outline">
            New Session
          </Button>
        </div>

        <Tabs value={mode} onValueChange={handleModeChange} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="explain" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Explain</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center space-x-2">
              <FileQuestion className="h-4 w-4" />
              <span>Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="flashcard" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Flashcards</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to AI Study Assistant</h3>
                <p className="text-gray-600 mb-6">Choose a mode above and start learning!</p>
                
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-gray-500 mb-3">Quick prompts for {mode}:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickPrompts[mode].map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(prompt)}
                        className="text-left justify-start"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-4">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask me anything about ${mode}...`}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
                {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-80 border-l bg-gray-50 p-4">
          <h3 className="font-semibold mb-4 flex items-center">
            <History className="h-4 w-4 mr-2" />
            Recent Sessions
          </h3>
          
          <p className="text-gray-500 text-sm">Session history coming soon! For now, use "New Session" to start fresh conversations.</p>
        </div>
      </div>
    </div>
  );
};

export default StudyAssistant;
