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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const today = new Date();
    const dateString = today.toLocaleDateString('hi-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const systemPrompt = `You are a Current Affairs expert for Indian students. Generate 10 latest and most important current affairs facts for today (${dateString}). 

Focus on:
- Indian national news (government, policies, awards)
- International news affecting India
- Sports achievements by Indians
- Science & technology updates
- Important appointments and events
- Economic updates

Return a JSON array with exactly 10 items in this format:
[
  {
    "title": "Short Hindi title (5-8 words)",
    "value": "Detailed fact in Hindi (10-15 words)",
    "english": "Same fact in English (10-15 words)",
    "category": "One of: राष्ट्रीय, अंतर्राष्ट्रीय, खेल, विज्ञान, अर्थव्यवस्था, नियुक्ति"
  }
]

Make facts educational, accurate, and relevant for competitive exams. Use simple Hindi that students can understand.`;

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
          { role: 'user', content: `Generate 10 current affairs facts for ${dateString}. Return only valid JSON array, no markdown.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          facts: getDefaultFacts()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Service temporarily unavailable.',
          facts: getDefaultFacts()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let facts;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      facts = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      facts = getDefaultFacts();
    }

    return new Response(JSON.stringify({ 
      facts,
      date: dateString,
      generatedAt: today.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-current-affairs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      facts: getDefaultFacts(),
      date: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getDefaultFacts() {
  return [
    { title: "भारतीय अर्थव्यवस्था", value: "भारत विश्व की 5वीं सबसे बड़ी अर्थव्यवस्था बना", english: "India becomes 5th largest economy in the world", category: "अर्थव्यवस्था" },
    { title: "चंद्रयान-3 मिशन", value: "भारत चंद्रमा के दक्षिणी ध्रुव पर उतरने वाला पहला देश", english: "India first country to land on Moon's south pole", category: "विज्ञान" },
    { title: "G20 अध्यक्षता", value: "भारत ने सफलतापूर्वक G20 की अध्यक्षता पूरी की", english: "India successfully completed G20 presidency", category: "अंतर्राष्ट्रीय" },
    { title: "डिजिटल इंडिया", value: "UPI ने 10 अरब मासिक लेनदेन का आंकड़ा पार किया", english: "UPI crosses 10 billion monthly transactions", category: "राष्ट्रीय" },
    { title: "क्रिकेट विजय", value: "भारत ने एशिया कप 2023 जीता", english: "India won Asia Cup 2023", category: "खेल" },
    { title: "आदित्य L1 मिशन", value: "भारत का पहला सूर्य मिशन सफलतापूर्वक लॉन्च", english: "India's first solar mission launched successfully", category: "विज्ञान" },
    { title: "नई शिक्षा नीति", value: "NEP 2020 का देशभर में क्रियान्वयन जारी", english: "NEP 2020 implementation continues nationwide", category: "राष्ट्रीय" },
    { title: "स्वच्छ भारत अभियान", value: "स्वच्छ भारत मिशन का दूसरा चरण जारी", english: "Swachh Bharat Mission phase 2 continues", category: "राष्ट्रीय" },
    { title: "आयुष्मान भारत", value: "50 करोड़ से अधिक लाभार्थियों को कवर किया", english: "Ayushman Bharat covers 50 crore+ beneficiaries", category: "राष्ट्रीय" },
    { title: "मेक इन इंडिया", value: "भारत में सेमीकंडक्टर निर्माण की शुरुआत", english: "Semiconductor manufacturing begins in India", category: "अर्थव्यवस्था" },
  ];
}
