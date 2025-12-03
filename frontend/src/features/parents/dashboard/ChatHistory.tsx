import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import { getChatHistory } from '../../../api/services/interactionService';
import { useChild } from '../../../providers/ChildProvider';
import { Loading } from '../../../components/ui';

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const ChatHistory = () => {
  const { selectedChildId } = useChild();
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Fetch chat history from API
  const { data: chatHistory, isLoading, error } = useQuery({
    queryKey: ['chat-history', selectedChildId],
    queryFn: async () => {
      const data = await getChatHistory(selectedChildId!, 20);
      console.log('ChatHistory - Fetched data:', data);
      console.log('ChatHistory - Data length:', data?.length);
      return data;
    },
    enabled: !!selectedChildId && isExpanded,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Debug logging
  useEffect(() => {
    if (isExpanded && selectedChildId) {
      console.log('ChatHistory - Expanded:', isExpanded);
      console.log('ChatHistory - Selected Child ID:', selectedChildId);
      console.log('ChatHistory - Data:', chatHistory);
      console.log('ChatHistory - Is Loading:', isLoading);
      console.log('ChatHistory - Error:', error);
    }
  }, [isExpanded, selectedChildId, chatHistory, isLoading, error]);

  // Check if scrollable and show indicator
  useEffect(() => {
    if (!isExpanded || !chatHistory) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const hasScroll = container.scrollHeight > container.clientHeight;
      const isScrolledToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      setShowScrollIndicator(hasScroll && !isScrolledToBottom);
    };

    // Check after a small delay to ensure DOM is updated
    const timeoutId = setTimeout(checkScrollable, 100);
    checkScrollable();
    
    container.addEventListener('scroll', checkScrollable);
    window.addEventListener('resize', checkScrollable);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', checkScrollable);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [isExpanded, chatHistory]);

  const getEmotionColor = (emotion: string) => {
    const emotionLower = emotion.toLowerCase();
    if (emotionLower.includes('happy') || emotionLower.includes('excited') || emotionLower.includes('proud')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (emotionLower.includes('sad') || emotionLower.includes('worried')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (emotionLower.includes('angry') || emotionLower.includes('frustrated')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (emotionLower.includes('curious')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-500" />
          <h3 className="text-base font-bold text-gray-900">Chat History</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="relative mt-3">
          <div 
            ref={scrollContainerRef}
            className="space-y-3 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loading size="sm" />
              </div>
            ) : !chatHistory || chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm font-medium text-gray-500">No chat history yet</p>
                <p className="text-xs text-gray-400 mt-1">Conversations will appear here</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="border border-gray-200 rounded-lg p-3 space-y-2 hover:border-primary-300 transition-colors"
                >
                  {/* Timestamp and Emotion */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {formatTimeAgo(chat.timestamp)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEmotionColor(
                        chat.detected_emotion
                      )}`}
                    >
                      {chat.detected_emotion}
                    </span>
                  </div>

                  {/* User Message */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2 text-sm text-gray-900">
                      {chat.user_input}
                    </div>
                  </div>

                  {/* Avatar Response */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div className="flex-1 bg-primary-50 rounded-lg p-2 text-sm text-gray-900">
                      {chat.avatar_response}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-2 transition-opacity duration-300">
              <ChevronDown className="w-4 h-4 text-gray-400 animate-bounce" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;

