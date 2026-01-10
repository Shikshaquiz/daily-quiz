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
    const { classNumber, examType, boardType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userMessage = '';

    if (examType) {
      // Competitive Exam Questions
      const examDetails: Record<string, { name: string; subjects: string[]; level: string }> = {
        navodaya: {
          name: "जवाहर नवोदय विद्यालय (JNVST)",
          subjects: ['मानसिक योग्यता', 'अंकगणित', 'भाषा परीक्षण', 'सामान्य ज्ञान'],
          level: "कक्षा 5-6 स्तर"
        },
        netarhat: {
          name: "नेतरहाट आवासीय विद्यालय",
          subjects: ['गणित', 'विज्ञान', 'सामान्य ज्ञान', 'तर्कशक्ति', 'अंग्रेज़ी'],
          level: "कक्षा 6 स्तर"
        },
        sainik: {
          name: "सैनिक स्कूल प्रवेश परीक्षा (AISSEE)",
          subjects: ['गणित', 'सामान्य ज्ञान', 'भाषा', 'बुद्धि परीक्षण'],
          level: "कक्षा 6/9 स्तर"
        },
        upsc: {
          name: "UPSC प्रारंभिक परीक्षा",
          subjects: ['भारतीय इतिहास', 'भूगोल', 'राजव्यवस्था', 'अर्थव्यवस्था', 'विज्ञान', 'पर्यावरण', 'करंट अफेयर्स'],
          level: "स्नातक स्तर"
        },
        bpsc: {
          name: "BPSC प्रारंभिक परीक्षा",
          subjects: ['बिहार का इतिहास', 'भारतीय इतिहास', 'भूगोल', 'राजव्यवस्था', 'अर्थव्यवस्था', 'सामान्य विज्ञान', 'करंट अफेयर्स'],
          level: "स्नातक स्तर"
        }
      };

      const exam = examDetails[examType] || examDetails.navodaya;
      const randomSubject = exam.subjects[Math.floor(Math.random() * exam.subjects.length)];

      console.log(`Generating ${exam.name} quiz for subject: ${randomSubject}`);

      systemPrompt = `आप एक शैक्षिक सहायक हैं जो ${exam.name} परीक्षा के लिए ${randomSubject} विषय पर बहुविकल्पीय प्रश्न (MCQ) बनाते हैं।

यह परीक्षा ${exam.level} की है।

आपको JSON format में एक MCQ प्रश्न return करना है:
{
  "question": "प्रश्न यहाँ लिखें",
  "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
  "correctAnswer": "सही विकल्प यहाँ",
  "subject": "${randomSubject}",
  "explanation": "उत्तर की संक्षिप्त व्याख्या"
}

प्रश्न:
- ${exam.name} परीक्षा के पैटर्न के अनुसार होना चाहिए
- ${exam.level} के अनुरूप कठिनाई स्तर होना चाहिए
- हिंदी में होना चाहिए
- शैक्षिक और परीक्षा-उपयोगी होना चाहिए`;

      userMessage = `${exam.name} परीक्षा के लिए ${randomSubject} विषय पर एक नया MCQ प्रश्न बनाएं।`;

    } else if (classNumber) {
      // Class-based Questions with Board Support
      const board = boardType || 'ncert';
      const boardName = board === 'bihar' ? 'बिहार बोर्ड (BSEB)' : 'NCERT';
      const boardDescription = board === 'bihar' 
        ? 'बिहार विद्यालय परीक्षा समिति (Bihar School Examination Board - BSEB) के पाठ्यक्रम'
        : 'NCERT (राष्ट्रीय शैक्षिक अनुसंधान और प्रशिक्षण परिषद) के पाठ्यक्रम';
      
      const subjects = board === 'bihar' 
        ? ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'हिंदी', 'संस्कृत']
        : ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'हिंदी', 'अंग्रेज़ी'];
      
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];

      console.log(`Generating quiz for class ${classNumber}, board: ${board}, subject: ${randomSubject}`);

      systemPrompt = `आप एक शैक्षिक सहायक हैं जो कक्षा ${classNumber} के लिए ${randomSubject} विषय पर बहुविकल्पीय प्रश्न (MCQ) बनाते हैं। 
    
प्रश्न ${boardDescription} के अनुसार होना चाहिए और छात्र की कक्षा ${classNumber} के स्तर के अनुरूप होना चाहिए।

${board === 'bihar' ? `
बिहार बोर्ड के लिए विशेष निर्देश:
- प्रश्न BSEB (बिहार बोर्ड) की पाठ्यपुस्तकों से संबंधित होने चाहिए
- बिहार राज्य से संबंधित उदाहरण और संदर्भ का उपयोग करें जहां उचित हो
- पाठ्यक्रम बिहार बोर्ड के syllabus के अनुसार हो
` : `
NCERT के लिए विशेष निर्देश:
- प्रश्न NCERT की पाठ्यपुस्तकों से संबंधित होने चाहिए
- राष्ट्रीय स्तर के उदाहरण और संदर्भ का उपयोग करें
- पाठ्यक्रम NCERT syllabus के अनुसार हो
`}

आपको JSON format में एक MCQ प्रश्न return करना है:
{
  "question": "प्रश्न यहाँ लिखें",
  "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
  "correctAnswer": "सही विकल्प यहाँ",
  "subject": "${randomSubject}",
  "explanation": "उत्तर की संक्षिप्त व्याख्या"
}

प्रश्न हिंदी में होना चाहिए और छात्रों के लिए शैक्षिक और रोचक होना चाहिए।`;

      userMessage = `${boardName} पाठ्यक्रम के अनुसार कक्षा ${classNumber} के लिए ${randomSubject} विषय पर एक नया MCQ प्रश्न बनाएं।`;
    } else {
      throw new Error('Either classNumber or examType is required');
    }

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
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
