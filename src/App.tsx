import { useState } from 'react';
import { SetupFlow } from '@/components/SetupFlow';
import { InterviewSession } from '@/components/InterviewSession';
import { FeedbackScreen } from '@/components/FeedbackScreen';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

export interface InterviewData {
  jobDescription: string;
  resume: string;
  coverLetter?: string;
  apiKeys: {
    deepgram: string;
    speechify: string;
    openai: string;
  };
}

export interface FeedbackData {
  strengths: Array<{
    title: string;
    description: string;
    moment: string;
  }>;
  improvements: Array<{
    title: string;
    description: string;
    suggestion: string;
  }>;
}

export type AppState = 'setup' | 'interviewing' | 'feedback';

function App() {
  const [appState, setAppState] = useState<AppState>('setup');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    speaker: 'interviewer' | 'candidate';
    message: string;
    timestamp: Date;
  }>>([]);

  const handleSetupComplete = (data: InterviewData) => {
    setInterviewData(data);
    setAppState('interviewing');
  };

  const handleInterviewComplete = (feedback: FeedbackData, history: typeof conversationHistory) => {
    setFeedbackData(feedback);
    setConversationHistory(history);
    setAppState('feedback');
  };

  const handleRestart = () => {
    setAppState('setup');
    setInterviewData(null);
    setFeedbackData(null);
    setConversationHistory([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {appState === 'setup' && (
        <SetupFlow onComplete={handleSetupComplete} />
      )}
      
      {appState === 'interviewing' && interviewData && (
        <InterviewSession 
          interviewData={interviewData}
          onComplete={handleInterviewComplete}
        />
      )}
      
      {appState === 'feedback' && feedbackData && (
        <FeedbackScreen 
          feedbackData={feedbackData}
          conversationHistory={conversationHistory}
          onRestart={handleRestart}
        />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;