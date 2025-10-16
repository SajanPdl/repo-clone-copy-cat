
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const FloatingAIButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAIAssistant = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/study-assistant');
  };

  const handleChatBot = () => {
    // This will trigger the existing ChatBot component
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
      {isExpanded && (
        <div className="flex flex-col space-y-2 animate-in slide-in-from-bottom-2">
          <Button
            onClick={handleAIAssistant}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg flex items-center space-x-2 px-4 py-2"
          >
            <Bot className="h-4 w-4" />
            <span>AI Study Assistant</span>
          </Button>
          
          <Button
            onClick={handleChatBot}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg flex items-center space-x-2 px-4 py-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Quick Chat</span>
          </Button>
        </div>
      )}

      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="rounded-full h-14 w-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300 hover:scale-110"
        size="icon"
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </Button>
    </div>
  );
};

export default FloatingAIButton;
