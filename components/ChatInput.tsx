import React, { useState } from 'react';
import { SendIcon, MicrophoneIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  toggleListening: () => void;
  isSpeechSupported: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isListening, toggleListening, isSpeechSupported }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const micButtonColor = isListening ? 'text-red-500' : 'text-teal-500';
  const micButtonHover = isListening ? 'hover:text-red-600' : 'hover:text-teal-600';

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-t-lg">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 flex items-center space-x-2 sm:space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "El asistente está respondiendo..." : (isListening ? "Escuchando..." : "Escribe tu mensaje aquí...")}
          disabled={isLoading || isListening}
          className="flex-grow w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow duration-200 disabled:opacity-50"
          aria-label="Entrada de chat"
        />
        {isSpeechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${micButtonColor} ${micButtonHover} disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
            aria-label={isListening ? "Dejar de escuchar" : "Empezar a escuchar"}
          >
            <MicrophoneIcon className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !input.trim() || isListening}
          className="flex-shrink-0 w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          aria-label="Enviar mensaje"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
