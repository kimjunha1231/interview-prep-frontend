import { useState, useRef, useEffect } from "react";

interface UseAudioRecorderResult {
  isRecording: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearAudio: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderResult => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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
  };

  const clearAudio = () => {
    revokeOldUrl();
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
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

