import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChatInput from './components/ChatInput';
import ChatWindow from './components/ChatWindow';
import { Message, Sender } from './types';
import { streamChat } from './services/geminiService';
import { BotIcon } from './components/icons';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationStarted = useRef(false);

  const {
    transcript,
    isListening,
    toggleListening,
    setTranscript,
    isSupported: isSpeechRecSupported,
  } = useSpeechRecognition();
  
  const { 
    speak,
    cancel,
    isSpeaking,
    isSupported: isSpeechSynthSupported
  } = useSpeechSynthesis();

  const handleSendMessage = useCallback(async (text: string) => {
    if (isSpeaking) {
      cancel();
    }
    const userMessage: Message = { id: Date.now(), text, sender: Sender.User };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = Date.now() + 1;
    let fullResponse = '';
    
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: Sender.AI }]);

    try {
        const stream = streamChat(text);
        for await (const chunk of stream) {
          const sanitizedChunk = chunk.text.replace(/\*/g, '');
          fullResponse += sanitizedChunk;
          setMessages(prev =>
            prev.map(m => m.id === aiMessageId ? { ...m, text: fullResponse } : m)
          );
        }
    } catch (error) {
      console.error("Error en la transmisión del chat:", error);
      fullResponse = 'Lo siento, no pude procesar tu solicitud en este momento.';
      setMessages(prev => 
        prev.map(m => m.id === aiMessageId ? { ...m, text: fullResponse } : m)
      );
    } finally {
      setIsLoading(false);
      if (fullResponse && isSpeechSynthSupported) {
          speak({ text: fullResponse });
      }
    }
  }, [cancel, isSpeaking, isSpeechSynthSupported, speak]);
  
  useEffect(() => {
    if (transcript) {
        handleSendMessage(transcript);
        setTranscript('');
    }
  }, [transcript, handleSendMessage, setTranscript]);
  
  useEffect(() => {
    if (conversationStarted.current) {
      return;
    }
    conversationStarted.current = true;

    const startConversation = async () => {
        setIsLoading(true);
        const aiMessageId = Date.now();
        setMessages([{ id: aiMessageId, text: '', sender: Sender.AI }]);

        let fullResponse = '';
        try {
            const stream = streamChat('Hola');
            for await (const chunk of stream) {
                const sanitizedChunk = chunk.text.replace(/\*/g, '');
                fullResponse += sanitizedChunk;
                setMessages(prev =>
                    prev.map(m => m.id === aiMessageId ? { ...m, text: fullResponse } : m)
                );
            }
        } catch (error) {
            console.error("Error al iniciar la conversación:", error);
            fullResponse = 'Lo siento, ha ocurrido un error al conectar. Por favor, intenta de nuevo más tarde.';
            setMessages(prev =>
                prev.map(m => m.id === aiMessageId ? { ...m, text: fullResponse } : m)
            );
        } finally {
            setIsLoading(false);
            // NOTE: Do not automatically play the welcome message to avoid "not-allowed" error.
            // The user can click the speaker icon to play it, which counts as user interaction.
        }
    };
    startConversation();
  }, []); 

  const handleReplaySpeak = useCallback((text: string) => {
    // This is called by a user click, so it's always allowed.
    if (isSpeechSynthSupported) {
        speak({ text });
    }
  }, [isSpeechSynthSupported, speak]);


  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans">
      <header className="bg-white shadow-md w-full">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-center space-x-3">
            <BotIcon className="w-8 h-8 text-teal-500" />
            <h1 className="text-2xl font-bold text-gray-800">Asistente de Escritura</h1>
        </div>
      </header>
      <ChatWindow messages={messages} onSpeak={handleReplaySpeak} />
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading || isSpeaking}
        isListening={isListening}
        toggleListening={toggleListening}
        isSpeechSupported={isSpeechRecSupported}
      />
    </div>
  );
};

export default App;