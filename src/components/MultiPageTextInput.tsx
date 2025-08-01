import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Mail } from 'lucide-react';

interface MultiPageTextInputProps {
  values: {
    jobDescription: string;
    resume: string;
    coverLetter: string;
  };
  onChange: (field: keyof MultiPageTextInputProps['values'], value: string) => void;
}

const pages = [
  {
    key: 'jobDescription' as const,
    title: 'JOB DESCRIPTION',
    icon: FileText,
    placeholder: 'Paste the complete job description here...\n\nInclude responsibilities, requirements, qualifications, and any other relevant details.',
    maxWords: 650,
    maxTokens: 2000,
    required: true,
    color: 'bg-yellow-400'
  },
  {
    key: 'resume' as const,
    title: 'YOUR RESUME',
    icon: User,
    placeholder: 'Paste your complete resume/CV here...\n\nInclude work experience, education, skills, and achievements.',
    maxWords: 500,
    maxTokens: 1500,
    required: true,
    color: 'bg-blue-400'
  },
  {
    key: 'coverLetter' as const,
    title: 'COVER LETTER',
    icon: Mail,
    placeholder: 'Paste your cover letter here (optional)...\n\nThis will provide additional context for the interview.',
    maxWords: 400,
    maxTokens: 1000,
    required: false,
    color: 'bg-green-400'
  }
];

export function MultiPageTextInput({ values, onChange }: MultiPageTextInputProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const countWords = (text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getCurrentPageData = () => pages[currentPage];
  const currentData = getCurrentPageData();
  const currentValue = values[currentData.key];
  const wordCount = countWords(currentValue);
  const isOverLimit = wordCount > currentData.maxWords;

  return (
    <div className="space-y-6">
      {/* Page Navigation */}
      <div className="flex gap-2 justify-center">
        {pages.map((page, index) => {
          const Icon = page.icon;
          const isActive = index === currentPage;
          const hasContent = values[page.key].trim().length > 0;
          const isRequired = page.required;
          
          return (
            <Button
              key={index}
              onClick={() => setCurrentPage(index)}
              variant={isActive ? "default" : "outline"}
              className={`border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black ${
                isActive 
                  ? `${page.color} text-black hover:opacity-90` 
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <Icon className="mr-2 h-4 w-4" />
              {page.title}
              {hasContent && <Badge className="ml-2 bg-green-600 text-white">✓</Badge>}
              {isRequired && !hasContent && <Badge className="ml-2 bg-red-600 text-white">!</Badge>}
            </Button>
          );
        })}
      </div>

      {/* Current Page Content */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000]">
        <CardHeader className={`${currentData.color} border-b-4 border-black`}>
          <CardTitle className="flex items-center justify-between text-black">
            <div className="flex items-center">
              <currentData.icon className="mr-2 h-6 w-6" />
              {currentData.title}
              {currentData.required && <span className="ml-2 text-red-600">*</span>}
            </div>
            <div className="text-sm font-normal">
              <Badge 
                variant={isOverLimit ? "destructive" : "secondary"}
                className="border-2 border-black"
              >
                {wordCount} / {currentData.maxWords} words
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <Textarea
            value={currentValue}
            onChange={(e) => onChange(currentData.key, e.target.value)}
            placeholder={currentData.placeholder}
            className="min-h-[300px] border-4 border-black resize-none focus:ring-4 focus:ring-yellow-400 text-base"
          />
          
          {isOverLimit && (
            <p className="text-red-600 font-bold mt-2">
              ⚠️ Content exceeds {currentData.maxWords} word limit. Please trim your text.
            </p>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Tip:</strong> {
                currentData.key === 'jobDescription' 
                  ? 'Focus on key responsibilities, requirements, and qualifications that will shape interview questions.'
                  : currentData.key === 'resume'
                  ? 'Include your most relevant experience, skills, and achievements for this role.'
                  : 'Highlight your motivation and specific interest in this position.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}