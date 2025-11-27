import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { classNumber } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Generating quiz for class ${classNumber}`);

    const subjects = ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'हिंदी', 'अंग्रेज़ी'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];

    const systemPrompt = `आप एक शैक्षिक सहायक हैं जो कक्षा ${classNumber} के लिए ${randomSubject} विषय पर बहुविकल्पीय प्रश्न (MCQ) बनाते हैं। 
    
प्रश्न NCERT पाठ्यक्रम के अनुसार होना चाहिए और छात्र की कक्षा ${classNumber} के स्तर के अनुरूप होना चाहिए।

आपको JSON format में एक MCQ प्रश्न return करना है:
{
  "question": "प्रश्न यहाँ लिखें",
  "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
  "correctAnswer": "सही विकल्प यहाँ",
  "subject": "${randomSubject}",
  "explanation": "उत्तर की संक्षिप्त व्याख्या"
}

प्रश्न हिंदी में होना चाहिए और छात्रों के लिए शैक्षिक और रोचक होना चाहिए।`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `कक्षा ${classNumber} के लिए ${randomSubject} विषय पर एक नया MCQ प्रश्न बनाएं।` }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from AI response');
    }
    
    const quizData = JSON.parse(jsonMatch[0]);
    
    console.log('Quiz generated successfully:', quizData);

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});