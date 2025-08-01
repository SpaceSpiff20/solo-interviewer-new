import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RequestBody {
  transcript: string;
  conversationHistory: ConversationEntry[];
  jobDescription: string;
  resume: string;
  coverLetter?: string;
  apiKeys: {
    deepgram: string;
    speechify: string;
    openai: string;
  };
}

interface ConversationEntry {
  speaker: 'interviewer' | 'candidate';
  message: string;
  timestamp: string;
}

interface FeedbackData {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      transcript,
      conversationHistory,
      jobDescription,
      resume,
      coverLetter,
      apiKeys
    }: RequestBody = req.body;

    // Validate required fields
    if (!transcript || !apiKeys.openai) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build conversation context for OpenAI
    const conversationContext = conversationHistory
      .map(entry => `${entry.speaker}: ${entry.message}`)
      .join('\n');

    // System prompt for the AI interviewer
    const systemPrompt = `You are a professional job interviewer conducting a mock interview. Your role is to:

1. Ask relevant questions based on the job description and candidate's resume
2. Follow up on the candidate's responses with appropriate probing questions
3. Maintain a professional but friendly tone
4. Keep the interview flowing naturally
5. End the interview after 8-12 meaningful exchanges
6. Focus on behavioral, technical, and situational questions appropriate for the role

Job Description:
${jobDescription}

Candidate's Resume:
${resume}

${coverLetter ? `Cover Letter:\n${coverLetter}` : ''}

Current conversation:
${conversationContext}

Candidate's latest response: ${transcript}

Instructions:
- If this is early in the interview (fewer than 3 exchanges), ask foundational questions
- If this is mid-interview (3-8 exchanges), dive deeper into skills, experience, and scenarios
- If this is late in the interview (8+ exchanges), ask closing questions and prepare to end
- If you determine the interview should end (after sufficient questions), respond with exactly: "INTERVIEW_COMPLETE"
- Otherwise, provide your next interview question as a natural response
- Keep questions focused and professional
- Avoid yes/no questions; ask open-ended questions that encourage detailed responses`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please provide your next interview question or end the interview if appropriate. The candidate just said: "${transcript}"` }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Check if interview should end
    if (aiResponse === 'INTERVIEW_COMPLETE' || conversationHistory.length >= 20) {
      // Generate feedback
      const feedback = await generateFeedback({
        conversationHistory,
        jobDescription,
        resume,
        coverLetter,
        apiKey: apiKeys.openai
      });

      return res.status(200).json({
        isComplete: true,
        feedback
      });
    }

    // Return next question
    return res.status(200).json({
      isComplete: false,
      question: aiResponse
    });

  } catch (error) {
    console.error('Interview API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generateFeedback({
  conversationHistory,
  jobDescription,
  resume,
  coverLetter,
  apiKey
}: {
  conversationHistory: ConversationEntry[];
  jobDescription: string;
  resume: string;
  coverLetter?: string;
  apiKey: string;
}): Promise<FeedbackData> {
  const conversationText = conversationHistory
    .map(entry => `${entry.speaker}: ${entry.message}`)
    .join('\n');

  const feedbackPrompt = `As an expert interview coach, analyze this mock interview and provide constructive feedback. Focus on specific moments and actionable advice.

Job Description:
${jobDescription}

Candidate's Resume:
${resume}

${coverLetter ? `Cover Letter:\n${coverLetter}` : ''}

Interview Conversation:
${conversationText}

Please provide feedback in the following JSON format:
{
  "strengths": [
    {
      "title": "Strength title",
      "description": "What they did well",
      "moment": "Specific quote or moment from the interview"
    }
  ],
  "improvements": [
    {
      "title": "Area for improvement",
      "description": "What could be better",
      "suggestion": "Specific actionable advice"
    }
  ]
}

Focus on:
- Communication clarity and structure
- Specific examples and evidence provided
- Alignment with job requirements
- Professional presence and confidence
- Areas where responses could be strengthened

Provide 2-4 items in each category. Be specific and reference actual moments from the conversation.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert interview coach providing detailed, constructive feedback.' },
          { role: 'user', content: feedbackPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const feedbackText = data.choices[0]?.message?.content?.trim();

    if (!feedbackText) {
      throw new Error('No feedback generated');
    }

    // Parse JSON response
    const feedback = JSON.parse(feedbackText);
    return feedback;

  } catch (error) {
    console.error('Feedback generation error:', error);
    
    // Return fallback feedback if API fails
    return {
      strengths: [
        {
          title: "Participated in Mock Interview",
          description: "You completed the interview process and engaged with the questions",
          moment: "Throughout the interview session"
        }
      ],
      improvements: [
        {
          title: "Continue Practicing",
          description: "Regular practice helps improve interview performance",
          suggestion: "Schedule regular mock interviews to build confidence and refine your responses"
        }
      ]
    };
  }
}