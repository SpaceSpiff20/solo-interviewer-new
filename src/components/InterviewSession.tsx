import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';
import { InterviewData, FeedbackData, ConversationEntry } from '@/App';
import { useInterviewStream } from '@/hooks/useInterviewStream';
import { useToast } from '@/hooks/use-toast';

interface InterviewSessionProps {
  interviewData: InterviewData;
  onComplete: (feedback: FeedbackData, history: ConversationEntry[]) => void;
}

export function InterviewSession({ interviewData, onComplete }: InterviewSessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'starting' | 'active' | 'ending'>('starting');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  
  const conversationRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    startRecording,
    stopRecording,
    isConnected,
    error,
    partialTranscript,
    finalTranscript
  } = useInterviewStream({
    apiKeys: interviewData.apiKeys,
    onTranscriptReceived: handleTranscriptReceived,
    onInterviewerResponse: handleInterviewerResponse
  });

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Update current transcript
  useEffect(() => {
    setCurrentTranscript(partialTranscript);
  }, [partialTranscript]);

  // Handle final transcript
  useEffect(() => {
    if (finalTranscript) {
      setConversationHistory(prev => [...prev, {
        speaker: 'candidate',
        message: finalTranscript,
        timestamp: new Date()
      }]);
      setCurrentTranscript('');
    }
  }, [finalTranscript]);

  async function handleTranscriptReceived(transcript: string) {
    // Send transcript to backend API for next question
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          conversationHistory,
          jobDescription: interviewData.jobDescription,
          resume: interviewData.resume,
          coverLetter: interviewData.coverLetter,
          apiKeys: interviewData.apiKeys
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.isComplete) {
        // Interview is complete, show feedback
        setSessionStatus('ending');
        setTimeout(() => {
          onComplete(data.feedback, conversationHistory);
        }, 2000);
      } else {
        // Continue with next question
        handleInterviewerResponse(data.question);
      }
    } catch (error) {
      console.error('Failed to get next question:', error);
      toast({
        title: "Interview Error",
        description: "Failed to continue interview. Please check your connection.",
        variant: "destructive"
      });
    }
  }

  function handleInterviewerResponse(question: string) {
    setConversationHistory(prev => [...prev, {
      speaker: 'interviewer',
      message: question,
      timestamp: new Date()
    }]);
    setIsInterviewerSpeaking(true);
    
    // Simulate TTS completion (in real implementation, this would be triggered by TTS API)
    setTimeout(() => {
      setIsInterviewerSpeaking(false);
    }, question.length * 50); // Rough estimate based on speech rate
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
      setIsRecording(false);
    } else {
      await startRecording();
      setIsRecording(true);
      if (sessionStatus === 'starting') {
        setSessionStatus('active');
        // Start interview with first question
        handleInterviewerResponse("Hello! Thank you for taking the time to interview with us today. Let's start with a simple question: Can you tell me a bit about yourself and why you're interested in this position?");
      }
    }
  };

  const endInterview = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    }
    setSessionStatus('ending');
    // Generate feedback based on conversation
    setTimeout(() => {
      const mockFeedback: FeedbackData = {
        strengths: [
          {
            title: "Clear Communication",
            description: "You articulated your thoughts clearly and concisely",
            moment: "When explaining your previous role responsibilities"
          }
        ],
        improvements: [
          {
            title: "Provide More Specific Examples",
            description: "Consider using the STAR method to structure responses",
            suggestion: "When discussing achievements, include specific metrics and outcomes"
          }
        ]
      };
      onComplete(mockFeedback, conversationHistory);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-4 border-white shadow-[8px_8px_0px_0px_#fff]">
          <CardHeader className="bg-yellow-400 border-b-4 border-white">
            <CardTitle className="flex items-center justify-between text-black">
              <div className="flex items-center">
                <Mic className="mr-2 h-6 w-6" />
                MOCK INTERVIEW SESSION
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={sessionStatus === 'active' ? 'default' : 'secondary'}
                  className="border-2 border-black"
                >
                  {sessionStatus.toUpperCase()}
                </Badge>
                <Badge 
                  variant={isConnected ? 'default' : 'destructive'}
                  className="border-2 border-black"
                >
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Conversation History */}
        <Card className="border-4 border-white shadow-[8px_8px_0px_0px_#fff] bg-gray-800">
          <CardContent className="p-6">
            <div 
              ref={conversationRef}
              className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400"
            >
              {conversationHistory.map((entry, index) => (
                <div 
                  key={index}
                  className={`p-4 border-4 border-white ${
                    entry.speaker === 'interviewer' 
                      ? 'bg-blue-400 text-black ml-8' 
                      : 'bg-green-400 text-black mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-black text-white border-2 border-white">
                      {entry.speaker === 'interviewer' ? 'INTERVIEWER' : 'YOU'}
                    </Badge>
                    <span className="text-xs opacity-70">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-medium">{entry.message}</p>
                </div>
              ))}
              
              {/* Live transcript */}
              {currentTranscript && (
                <div className="p-4 border-4 border-dashed border-yellow-400 bg-yellow-400 text-black mr-8 opacity-75">
                  <Badge className="bg-black text-white border-2 border-white mb-2">
                    YOU (SPEAKING...)
                  </Badge>
                  <p className="font-medium">{currentTranscript}</p>
                </div>
              )}
              
              {/* Interviewer speaking indicator */}
              {isInterviewerSpeaking && (
                <div className="p-4 border-4 border-dashed border-blue-400 bg-blue-400 text-black ml-8">
                  <Badge className="bg-black text-white border-2 border-white">
                    INTERVIEWER (SPEAKING...)
                  </Badge>
                  <div className="flex items-center mt-2">
                    <Volume2 className="animate-pulse mr-2" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="border-4 border-white shadow-[8px_8px_0px_0px_#fff]">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={toggleRecording}
                disabled={!isConnected || sessionStatus === 'ending'}
                className={`w-20 h-20 rounded-full border-4 border-white shadow-[4px_4px_0px_0px_#fff] font-black text-lg ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-400 hover:bg-green-500 text-black'
                }`}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </Button>
              
              <div className="text-center">
                <p className="font-black text-lg">
                  {isRecording ? 'LISTENING...' : 'CLICK TO SPEAK'}
                </p>
                <p className="text-sm opacity-70">
                  {sessionStatus === 'starting' 
                    ? 'Click microphone to begin interview'
                    : sessionStatus === 'active'
                    ? 'Speak clearly into your microphone'
                    : 'Interview ending...'}
                </p>
              </div>
              
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="outline"
                className="w-16 h-16 rounded-full border-4 border-white shadow-[4px_4px_0px_0px_#fff]"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </Button>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button
                onClick={endInterview}
                variant="destructive"
                disabled={sessionStatus === 'ending'}
                className="border-4 border-white shadow-[4px_4px_0px_0px_#fff] font-black"
              >
                <Square className="mr-2 h-4 w-4" />
                END INTERVIEW
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}