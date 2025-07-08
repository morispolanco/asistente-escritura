import React from 'react';
import { Message, Sender } from '../types';
import { UserIcon, BotIcon, SpeakerIcon } from './icons';

interface MessageBubbleProps {
  message: Message;
  onSpeak?: (text: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak }) => {
  const isUser = message.sender === Sender.User;

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white'
    : 'bg-white text-gray-800 shadow-sm';
  
  const containerClasses = isUser
    ? 'justify-end'
    : 'justify-start';

  const Icon = isUser ? UserIcon : BotIcon;
  const iconContainerClasses = isUser ? 'order-2 ml-2' : 'order-1 mr-2';
  const textContainerClasses = isUser ? 'order-1 items-end' : 'order-2 items-start';

  const handleSpeakClick = () => {
    if (onSpeak && message.text) {
      onSpeak(message.text);
    }
  };

  return (
    <div className={`flex items-start max-w-4xl mx-auto ${containerClasses}`}>
      <div className={`flex-shrink-0 p-2 rounded-full text-white ${isUser ? 'bg-blue-600' : 'bg-teal-500'} ${iconContainerClasses}`}>
          <Icon className="w-6 h-6" />
      </div>
      <div className={`flex flex-col ${textContainerClasses}`}>
        <div className={`px-4 py-3 rounded-2xl max-w-xl md:max-w-2xl prose prose-sm ${bubbleClasses}`}>
          {message.text || <span className="inline-block w-2 h-5 bg-current animate-pulse"></span>}
        </div>
      </div>
      {!isUser && onSpeak && message.text && (
        <button
          onClick={handleSpeakClick}
          className="ml-2 text-slate-500 hover:text-teal-600 transition-colors duration-200 self-center"
          aria-label="Leer mensaje en voz alta"
        >
          <SpeakerIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MessageBubble;
