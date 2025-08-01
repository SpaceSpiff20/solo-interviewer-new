import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Mic, Brain, FileText } from 'lucide-react';
import { MultiPageTextInput } from '@/components/MultiPageTextInput';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { InterviewData } from '@/App';

interface SetupFlowProps {
  onComplete: (data: InterviewData) => void;
}

export function SetupFlow({ onComplete }: SetupFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    jobDescription: '',
    resume: '',
    coverLetter: '',
    apiKeys: {
      deepgram: '',
      speechify: '',
      openai: ''
    }
  });

  const steps = [
    { title: 'Documents', icon: FileText, component: 'documents' },
    { title: 'API Keys', icon: Brain, component: 'api-keys' },
    { title: 'Ready', icon: Mic, component: 'ready' }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.jobDescription.trim() && formData.resume.trim();
      case 1:
        return formData.apiKeys.deepgram && formData.apiKeys.speechify && formData.apiKeys.openai;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData as InterviewData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000]">
        <CardHeader className="text-center border-b-4 border-black bg-yellow-400">
          <CardTitle className="text-3xl font-black text-black">
            MOCK INTERVIEW SETUP
          </CardTitle>
          <div className="flex justify-center items-center gap-4 mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full border-4 border-black flex items-center justify-center font-black text-lg ${
                    index <= currentStep ? 'bg-green-400 text-black' : 'bg-white text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-400' : 'bg-gray-300'
                    } border-2 border-black`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="mt-4" />
        </CardHeader>

        <CardContent className="p-8">
          {currentStep === 0 && (
            <MultiPageTextInput
              values={{
                jobDescription: formData.jobDescription,
                resume: formData.resume,
                coverLetter: formData.coverLetter
              }}
              onChange={(field, value) => 
                setFormData(prev => ({ ...prev, [field]: value }))
              }
            />
          )}

          {currentStep === 1 && (
            <ApiKeyInput
              values={formData.apiKeys}
              onChange={(field, value) =>
                setFormData(prev => ({
                  ...prev,
                  apiKeys: { ...prev.apiKeys, [field]: value }
                }))
              }
            />
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-green-400 border-4 border-black rounded-full flex items-center justify-center">
                <Mic size={40} className="text-black" />
              </div>
              <h2 className="text-2xl font-black">READY TO START!</h2>
              <p className="text-lg">
                Your mock interview is configured and ready to begin. 
                Make sure you're in a quiet environment with a good microphone.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
                <div className="p-4 bg-yellow-400 border-4 border-black">
                  <h3 className="font-black mb-2">JOB DESCRIPTION</h3>
                  <p className="text-xs">{formData.jobDescription.substring(0, 100)}...</p>
                </div>
                <div className="p-4 bg-blue-400 border-4 border-black">
                  <h3 className="font-black mb-2">RESUME</h3>
                  <p className="text-xs">{formData.resume.substring(0, 100)}...</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-6 border-t-4 border-black bg-gray-100 flex justify-between">
          <Button 
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
            className="border-4 border-black shadow-[4px_4px_0px_0px_#000] disabled:shadow-none"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-green-400 hover:bg-green-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black"
          >
            {currentStep === steps.length - 1 ? 'START INTERVIEW' : 'NEXT'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}