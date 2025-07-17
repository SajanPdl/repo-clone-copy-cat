
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  X, 
  ChevronDown, 
  Send, 
  User, 
  BrainCircuit,
  RefreshCw,
  Sparkles 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Sample predefined responses for the demo
const demoResponses = [
  "Based on your previous study habits, I recommend focusing on chapter 5 with the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.",
  "I've analyzed your practice test results. You're doing well in algebra but might need more practice with trigonometric functions. Try these practice problems: [list of problems]",
  "For your physics exam, remember the key formulas we covered: F=ma, E=mc², and the equations for kinetic and potential energy. I've added these to your formula sheet.",
  "Looking at your schedule, the best time to study for your upcoming biology exam would be on Wednesday and Friday evenings, with a review session on Sunday morning.",
  "Based on your learning style assessment, you might benefit from visual learning techniques. Try creating mind maps for the chemistry concepts you're struggling with.",
  "I notice you've been studying late at night. Research suggests studying earlier in the day leads to better retention. Could you try shifting your study sessions earlier?",
  "For your English literature essay, I suggest focusing on these three themes: symbolism, character development, and historical context. Would you like me to help outline this approach?"
];

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const suggestedQuestions = [
  "What topics should I focus on for my upcoming math exam?",
  "Can you recommend study materials for physics?",
  "How do I improve my essay writing skills?",
  "What's the most effective way to memorize formulas?",
  "Can you create a study schedule for me?",
  "Explain the concept of photosynthesis in simple terms",
  "What are good resources for JEE preparation?"
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm your EduSanskriti AI study assistant. How can I help with your studies today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate bot thinking and responding
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: demoResponses[Math.floor(Math.random() * demoResponses.length)],
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleClearChat = () => {
    setMessages([
      {
        id: 'new-chat',
        text: "Chat cleared. How else can I help with your studies?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    toast('Chat history cleared');
  };
  
  const handleQuestionClick = (question: string) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`fixed right-6 bottom-6 rounded-full shadow-lg ${isOpen ? 'hidden' : 'flex'} items-center justify-center bg-edu-purple hover:bg-edu-purple/90 text-white transition-all duration-300 z-40`}
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      
      {/* Chat window */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'right-6 bottom-6 opacity-100' : 'right-6 -bottom-full opacity-0 pointer-events-none'
        } ${
          isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[600px] max-h-[80vh]'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col h-full overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Chat header */}
          <div className="p-3 bg-edu-purple text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              <span className="font-semibold">Study Assistant AI</span>
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 hover:bg-edu-purple-dark text-white"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 hover:bg-edu-purple-dark text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Chat messages */}
          {!isMinimized && (
            <div className="flex-grow overflow-y-auto p-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-edu-purple text-white">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`px-4 py-3 rounded-lg max-w-[80%] ${
                      message.sender === 'user' 
                        ? 'bg-edu-blue text-white rounded-tr-none' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 ml-2 mt-1">
                      <AvatarImage src="https://ui-avatars.com/api/?name=User&background=random" />
                      <AvatarFallback className="bg-edu-blue">U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-edu-purple text-white">AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Suggested questions */}
          {!isMinimized && messages.length < 3 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm"
                    className="text-xs py-1 h-auto"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat input */}
          {!isMinimized && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleClearChat}
                  className="h-8 w-8 flex-shrink-0"
                  title="Clear chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Textarea 
                  placeholder="Type your question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[40px] max-h-[120px] resize-none"
                  rows={1}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  disabled={!inputMessage.trim()}
                  className="h-8 w-8 flex-shrink-0 bg-edu-purple hover:bg-edu-purple/90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatBot;
