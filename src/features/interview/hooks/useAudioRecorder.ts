import { useState, useRef, useEffect } from "react";

const SpeechRecognition = typeof window !== "undefined"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null;

interface UseAudioRecorderResult {
  isRecording: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearAudio: () => void;
}

interface UseAudioRecorderOptions {
  onTranscriptUpdate?: (text: string) => void;
}

export const useAudioRecorder = (options?: UseAudioRecorderOptions): UseAudioRecorderResult => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const revokeOldUrl = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    revokeOldUrl();
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Detect browser-compatible MIME type
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudioBlob(blob);
        setAudioUrl(url);

        // Stop all tracks in stream to release microphone light
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start Web Speech API Recognition if supported
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "ko-KR";

          let finalTranscript = "";

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onresult = (event: any) => {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + " ";
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            const fullText = (finalTranscript + interimTranscript).trim();
            if (options?.onTranscriptUpdate) {
              options.onTranscriptUpdate(fullText);
            }
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
          };

          recognition.onend = () => {
            // Restart if recording is still active to avoid timeout during silence
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              try {
                recognition.start();
              } catch (e) {
                console.error("Failed to restart speech recognition:", e);
              }
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (e) {
          console.error("Failed to start speech recognition:", e);
        }
      }
    } catch (err) {
      console.error("Microphone hardware access failed:", err);
      throw err;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Break restart loop
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const clearAudio = () => {
    revokeOldUrl();
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  return {
    isRecording,
    audioUrl,
    audioBlob,
    startRecording,
    stopRecording,
    clearAudio
  };
};

