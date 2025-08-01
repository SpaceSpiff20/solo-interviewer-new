import { useState, useCallback, useRef } from 'react';

interface UseInterviewStreamProps {
  apiKeys: {
    deepgram: string;
    speechify: string;
    openai: string;
  };
  onTranscriptReceived: (transcript: string) => void;
  onInterviewerResponse: (response: string) => void;
}

export function useInterviewStream({
  apiKeys,
  onTranscriptReceived
}: UseInterviewStreamProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [endpointReached, setEndpointReached] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Create WebSocket connection to Deepgram
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2-general&language=en&smart_format=true&interim_results=true&endpointing=true`;
      const ws = new WebSocket(wsUrl, ['token', apiKeys.deepgram]);
      
      ws.onopen = () => {
        console.log('Connected to Deepgram');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'Results') {
          const transcript = data.channel?.alternatives?.[0]?.transcript;
          
          if (transcript) {
            if (data.is_final) {
              setFinalTranscript(transcript);
              setPartialTranscript('');
              onTranscriptReceived(transcript);
            } else {
              setPartialTranscript(transcript);
            }
          }
        }

        if (data.type === 'SpeechStarted') {
          setIsSpeaking(true);
        }

        if (data.type === 'UtteranceEnd') {
          setIsSpeaking(false);
          setEndpointReached(true);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to speech recognition service');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('Disconnected from Deepgram');
        setIsConnected(false);
      };

      wsRef.current = ws;

      // Set up MediaRecorder to send audio data
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.start(100); // Send data every 100ms
      mediaRecorderRef.current = mediaRecorder;

    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to access microphone or start recording');
    }
  }, [apiKeys.deepgram, onTranscriptReceived]);

  const stopRecording = useCallback(async () => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Close WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    setIsConnected(false);
    setIsSpeaking(false);
    setPartialTranscript('');
  }, []);

  return {
    startRecording,
    stopRecording,
    isConnected,
    error,
    partialTranscript,
    finalTranscript,
    isSpeaking,
    endpointReached
  };
}