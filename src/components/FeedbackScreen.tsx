import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, AlertTriangle, RotateCcw, Download, Clock } from 'lucide-react';
import { FeedbackData } from '@/App';

interface FeedbackScreenProps {
  feedbackData: FeedbackData;
  conversationHistory: Array<{
    speaker: 'interviewer' | 'candidate';
    message: string;
    timestamp: Date;
  }>;
  onRestart: () => void;
}

export function FeedbackScreen({ feedbackData, conversationHistory, onRestart }: FeedbackScreenProps) {
  const downloadTranscript = () => {
    const transcript = conversationHistory
      .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker.toUpperCase()}: ${entry.message}`)
      .join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const interviewDuration = conversationHistory.length > 0 
    ? Math.round((conversationHistory[conversationHistory.length - 1].timestamp.getTime() - conversationHistory[0].timestamp.getTime()) / 1000 / 60)
    : 0;

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-secondary">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <CardHeader className="bg-green-400 border-b-4 border-black">
            <CardTitle className="text-center text-black">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="mr-2 h-8 w-8" />
                INTERVIEW COMPLETE
              </div>
              <div className="flex items-center justify-center gap-6 text-sm font-normal">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Duration: {interviewDuration} minutes
                </div>
                <div>
                  Questions: {conversationHistory.filter(h => h.speaker === 'interviewer').length}
                </div>
                <div>
                  Responses: {conversationHistory.filter(h => h.speaker === 'candidate').length}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000]">
            <CardHeader className="bg-green-400 border-b-4 border-black">
              <CardTitle className="flex items-center text-black">
                <TrendingUp className="mr-2 h-6 w-6" />
                STRENGTHS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {feedbackData.strengths.map((strength, index) => (
                <div key={index} className="p-4 border-4 border-black bg-green-100">
                  <h3 className="font-black text-lg mb-2">{strength.title}</h3>
                  <p className="mb-3">{strength.description}</p>
                  <div className="p-2 bg-green-400 border-2 border-black">
                    <p className="text-sm font-bold">Specific Moment:</p>
                    <p className="text-sm italic">"{strength.moment}"</p>
                  </div>
                </div>
              ))}
              
              {feedbackData.strengths.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p>No specific strengths identified in this session.</p>
                  <p className="text-sm mt-2">Try a longer interview for more detailed feedback.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000]">
            <CardHeader className="bg-orange-400 border-b-4 border-black">
              <CardTitle className="flex items-center text-black">
                <AlertTriangle className="mr-2 h-6 w-6" />
                AREAS FOR IMPROVEMENT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {feedbackData.improvements.map((improvement, index) => (
                <div key={index} className="p-4 border-4 border-black bg-orange-100">
                  <h3 className="font-black text-lg mb-2">{improvement.title}</h3>
                  <p className="mb-3">{improvement.description}</p>
                  <div className="p-2 bg-orange-400 border-2 border-black">
                    <p className="text-sm font-bold">Suggestion:</p>
                    <p className="text-sm italic">{improvement.suggestion}</p>
                  </div>
                </div>
              ))}
              
              {feedbackData.improvements.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p>Great job! No major areas for improvement identified.</p>
                  <p className="text-sm mt-2">Keep practicing to maintain your interview skills.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversation Summary */}
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <CardHeader className="bg-blue-400 border-b-4 border-black">
            <CardTitle className="text-black">CONVERSATION SUMMARY</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversationHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge 
                    className={`border-2 border-black ${
                      entry.speaker === 'interviewer' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}
                    style={{ minWidth: 'fit-content' }}
                  >
                    {entry.speaker === 'interviewer' ? 'INT' : 'YOU'}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{entry.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4 border-2 border-black" />
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={downloadTranscript}
                variant="outline"
                className="border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black"
              >
                <Download className="mr-2 h-4 w-4" />
                DOWNLOAD TRANSCRIPT
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <CardContent className="p-6">
            <div className="flex justify-center gap-4">
              <Button
                onClick={onRestart}
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                START NEW INTERVIEW
              </Button>
            </div>
            
            <div className="text-center mt-6 space-y-2">
              <p className="font-bold">Keep practicing to improve your interview skills!</p>
              <p className="text-sm text-gray-600">
                Regular mock interviews help build confidence and improve performance in real interviews.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}