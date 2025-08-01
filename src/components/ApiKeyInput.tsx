import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ExternalLink, Key } from 'lucide-react';

interface ApiKeyInputProps {
  values: {
    deepgram: string;
    speechify: string;
    openai: string;
  };
  onChange: (field: keyof ApiKeyInputProps['values'], value: string) => void;
}

const apiServices = [
  {
    key: 'deepgram' as const,
    name: 'Deepgram',
    description: 'Speech-to-Text (ASR)',
    placeholder: 'sk_deepgram_...',
    signupUrl: 'https://console.deepgram.com/signup',
    docsUrl: 'https://developers.deepgram.com/docs/create-additional-api-keys',
    color: 'bg-purple-400',
    required: true
  },
  {
    key: 'speechify' as const,
    name: 'Speechify',
    description: 'Text-to-Speech (TTS)',
    placeholder: 'sk_speechify_...',
    signupUrl: 'https://speechify.com/api',
    docsUrl: 'https://docs.speechify.com/api/authentication',
    color: 'bg-orange-400',
    required: true
  },
  {
    key: 'openai' as const,
    name: 'OpenAI',
    description: 'AI Interviewer (GPT-4o)',
    placeholder: 'sk-...',
    signupUrl: 'https://platform.openai.com/signup',
    docsUrl: 'https://platform.openai.com/api-keys',
    color: 'bg-green-400',
    required: true
  }
];

export function ApiKeyInput({ values, onChange }: ApiKeyInputProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black mb-2">API KEYS REQUIRED</h2>
        <p className="text-gray-600">
          Your API keys are used client-side and never stored permanently. 
          They're only kept in memory during your interview session.
        </p>
      </div>

      <div className="grid gap-6">
        {apiServices.map((service) => {
          const currentValue = values[service.key];
          const isValid = currentValue.length > 10; // Basic validation
          
          return (
            <Card key={service.key} className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <CardHeader className={`${service.color} border-b-4 border-black`}>
                <CardTitle className="flex items-center justify-between text-black">
                  <div className="flex items-center">
                    <Key className="mr-2 h-5 w-5" />
                    {service.name}
                    <span className="ml-2 text-sm font-normal">({service.description})</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-2 border-black text-black bg-white hover:bg-gray-100"
                      onClick={() => window.open(service.signupUrl, '_blank')}
                    >
                      Sign Up
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-2 border-black text-black bg-white hover:bg-gray-100"
                      onClick={() => window.open(service.docsUrl, '_blank')}
                    >
                      Docs
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor={service.key} className="font-bold">
                    {service.name} API Key {service.required && <span className="text-red-600">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={service.key}
                      type={showKeys[service.key] ? "text" : "password"}
                      value={currentValue}
                      onChange={(e) => onChange(service.key, e.target.value)}
                      placeholder={service.placeholder}
                      className="border-4 border-black pr-12 focus:ring-4 focus:ring-yellow-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => toggleShowKey(service.key)}
                    >
                      {showKeys[service.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Get your API key from the {service.name} dashboard
                    </p>
                    {isValid && (
                      <span className="text-green-600 font-bold text-sm">✓ Valid format</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000] bg-yellow-50">
        <CardContent className="p-6">
          <h3 className="font-black mb-2 flex items-center">
            <Key className="mr-2 h-5 w-5" />
            SECURITY & PRIVACY
          </h3>
          <ul className="space-y-1 text-sm">
            <li>• Your API keys are never sent to our servers or stored permanently</li>
            <li>• Keys are only used client-side for direct API communication</li>
            <li>• All conversation data is temporary and purged after your session</li>
            <li>• You maintain full control over your API usage and billing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}