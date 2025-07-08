import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    const handleVoicesChanged = useCallback(() => {
        if (synthRef.current) {
            // Filter for Spanish voices
            voicesRef.current = synthRef.current.getVoices().filter(voice => voice.lang.startsWith('es'));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSupported(true);
            const synth = window.speechSynthesis;
            synthRef.current = synth;
            
            // The 'voiceschanged' event is the correct way to wait for voices to load.
            synth.addEventListener('voiceschanged', handleVoicesChanged);
            // Also call it once initially, in case voices are already loaded.
            handleVoicesChanged();
            
            return () => {
                synth.removeEventListener('voiceschanged', handleVoicesChanged);
            };
        }
    }, [handleVoicesChanged]);

    const speak = useCallback(({ text, onEnd }: { text: string; onEnd?: () => void }) => {
        const synth = synthRef.current;
        if (!synth || !text) return;

        // Ensure any ongoing speech is stopped before starting a new one.
        if (synth.speaking) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';

        // Attempt to find a suitable Spanish voice.
        const spanishVoice = voicesRef.current.find(v => v.lang === 'es-ES') || voicesRef.current.find(v => v.lang === 'es-MX') || voicesRef.current.find(v => v.lang.startsWith('es-'));
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
        };
        // This is the key fix: The event object needs to be inspected for the 'error' property.
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            console.error('Speech synthesis error:', e.error);
            setIsSpeaking(false);
        };
        
        // Use a timeout to avoid issues on some browsers where speak() is called too soon after cancel().
        setTimeout(() => {
             synth.speak(utterance);
        }, 0);
    }, []);

    const cancel = useCallback(() => {
        const synth = synthRef.current;
        if (synth && synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return { isSpeaking, speak, cancel, isSupported };
};
