import { useState, useRef, useCallback } from "react";
import { getLanguageCode } from "@/lib/languages";

interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<SpeechResult[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const start = useCallback((language: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(language);

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setResults((prev) => [
            ...prev,
            {
              transcript: result[0].transcript,
              confidence: Math.round(result[0].confidence * 100),
              isFinal: true,
            },
          ]);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      if (isListening && !isPaused) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setIsPaused(false);
  }, [isListening, isPaused]);

  const pause = useCallback(() => {
    recognitionRef.current?.stop();
    setIsPaused(true);
  }, []);

  const resume = useCallback((language: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguageCode(language);
      recognitionRef.current.start();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setIsPaused(false);
    setInterimTranscript("");
  }, []);

  const reset = useCallback(() => {
    stop();
    setResults([]);
    setInterimTranscript("");
  }, [stop]);

  const fullTranscript = results.map((r) => r.transcript).join(" ") + (interimTranscript ? " " + interimTranscript : "");

  return {
    isListening,
    isPaused,
    isSupported,
    results,
    interimTranscript,
    fullTranscript,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
