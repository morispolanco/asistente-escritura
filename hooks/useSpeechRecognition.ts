import { useState, useEffect, useRef, useCallback } from 'react';

// Minimal TypeScript definitions for the Web Speech API to fix compilation errors.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedTranscriptRef = useRef('');
  const manualStopRef = useRef(false); // Flag to differentiate manual stop from timeout

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = true; // Keep listening even through pauses
    recognition.lang = 'es-ES';
    recognition.interimResults = false; // We only care about the final transcript for each segment

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Rebuild the full transcript from all final results received so far
      const fullTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      accumulatedTranscriptRef.current = fullTranscript;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      manualStopRef.current = true; // Treat error as a manual stop to halt listening
      setIsListening(false);
    };

    recognition.onend = () => {
      if (manualStopRef.current) {
        // User clicked stop or an error occurred. Finalize the process.
        setIsListening(false);
        setTranscript(accumulatedTranscriptRef.current.trim());
      } else if (recognitionRef.current) {
        // This was a timeout. Restart recognition to continue listening seamlessly.
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Speech recognition restart failed:', error);
          setIsListening(false);
        }
      }
    };

    return () => {
      // Cleanup on unmount
      manualStopRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      // Set the flag and stop recognition. The onend handler will do the cleanup.
      manualStopRef.current = true;
      recognitionRef.current.stop();
    } else {
      // Reset everything and start a new session.
      setTranscript(''); 
      accumulatedTranscriptRef.current = ''; 
      manualStopRef.current = false;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition:", e);
        setIsListening(false);
      }
    }
  }, [isListening]);

  return { isListening, toggleListening, transcript, setTranscript, isSupported: !!SpeechRecognitionAPI };
};