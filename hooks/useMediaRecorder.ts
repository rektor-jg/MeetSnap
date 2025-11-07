import { useState, useRef, useEffect, useCallback } from 'react';
import type { RecordingError } from '../types';

type Status = 'idle' | 'recording' | 'paused' | 'stopped';

interface UseMediaRecorderProps {
  onStop: (blob: Blob) => void;
  onDataAvailable?: (chunk: Blob) => void;
  onStreamReady?: (stream: MediaStream) => void;
}

interface StartRecordingOptions {
  includeMicrophone: boolean;
}

export const useMediaRecorder = ({ onStop, onDataAvailable, onStreamReady }: UseMediaRecorderProps) => {
  const [status, setStatus] = useState<Status>('idle');
  const [time, setTime] = useState(0);
  const [error, setError] = useState<RecordingError | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    // Stop all media tracks
    streamsRef.current.forEach(stream => stream.getTracks().forEach(track => track.stop()));
    streamsRef.current = [];
    
    // Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;

    // Ensure MediaRecorder is stopped and listeners are removed
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer(); // Ensure no multiple timers are running
    timerIntervalRef.current = window.setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  }, [stopTimer]);
  
  const handleRecordingError = useCallback((err: unknown) => {
    console.error("Recording Error:", err);
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        setError({ type: 'PERMISSION_DENIED' });
      } else if (err.name === 'NotSupportedError') {
        setError({ type: 'NOT_SUPPORTED' });
      } else {
        setError({ type: 'UNKNOWN' });
      }
    } else if (err instanceof Error && err.message === 'NO_AUDIO_TRACK') {
      setError({ type: 'NO_AUDIO_TRACK' });
    } else {
      setError({ type: 'UNKNOWN' });
    }
    setStatus('idle');
    cleanup();
  }, [cleanup]);

  const start = useCallback(async ({ includeMicrophone }: StartRecordingOptions) => {
    setError(null);
    setTime(0);
    cleanup(); // Clean up any previous state
    const acquiredStreams: MediaStream[] = [];
    
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true, 
      });
      acquiredStreams.push(displayStream);

      if (displayStream.getAudioTracks().length === 0) {
        throw new Error('NO_AUDIO_TRACK');
      }

      audioContextRef.current = new AudioContext();
      const destination = audioContextRef.current.createMediaStreamDestination();
      
      const systemSource = audioContextRef.current.createMediaStreamSource(displayStream);
      systemSource.connect(destination);

      if (includeMicrophone) {
          try {
            const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            acquiredStreams.push(userStream);
            const micSource = audioContextRef.current.createMediaStreamSource(userStream);
            micSource.connect(destination);
          } catch (micError) {
              console.warn("Could not get microphone stream. Recording will continue with system audio only.", micError);
          }
      }
      
      streamsRef.current = acquiredStreams;

      displayStream.getVideoTracks().forEach(track => track.stop());
      
      const combinedStream = destination.stream;
      
      onStreamReady?.(combinedStream);

      setStatus('recording');
      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          onDataAvailable?.(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onStop(blob);
        setStatus('stopped');
        cleanup();
      };
      
      mediaRecorder.start(3000);
      startTimer();

    } catch (err) {
      acquiredStreams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
      handleRecordingError(err);
    }
  }, [onStop, onDataAvailable, onStreamReady, startTimer, cleanup, handleRecordingError]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  }, [stopTimer]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
      stopTimer();
    }
  }, [status, stopTimer]);
  
  const resume = useCallback(() => {
    if (mediaRecorderRef.current && status === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      startTimer();
    }
  }, [status, startTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      cleanup();
    };
  }, [stopTimer, cleanup]);

  return { status, time, start, stop, pause, resume, error };
};