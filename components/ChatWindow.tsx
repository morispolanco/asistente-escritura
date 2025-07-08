import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  onSpeak?: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSpeak }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-grow p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onSpeak={onSpeak} />
      ))}
    </div>
  );
};

export default ChatWindow;
