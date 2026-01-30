import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, chapterName, subjectName, className, numQuestions = 10 } = await req.json();
    
    console.log("Generating questions for:", { chapterName, subjectName, className, numQuestions });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract class number from className (e.g., "Class 1" -> 1)
    const classMatch = className?.match(/\d+/);
    const classLevel = classMatch ? parseInt(classMatch[0]) : 1;

    // Determine board type from context (default to NCERT)
    const boardType = pdfUrl?.includes('bihar') ? 'Bihar Board' : 'NCERT';

    const systemPrompt = `आप एक विशेषज्ञ शैक्षिक सामग्री निर्माता हैं जो भारतीय स्कूली छात्रों के लिए बहुविकल्पीय प्रश्न (MCQ) बनाते हैं।

आपको ${className} के ${subjectName} विषय के "${chapterName}" अध्याय के लिए ${boardType} पाठ्यक्रम के अनुसार प्रश्न बनाने हैं।

महत्वपूर्ण नियम:
1. ठीक ${numQuestions} प्रश्न बनाएं
2. प्रत्येक प्रश्न में ठीक 4 विकल्प होने चाहिए
3. प्रश्न ${className} के स्तर के अनुसार होने चाहिए
4. ${boardType} के पाठ्यक्रम के अनुसार प्रश्न बनाएं
5. प्रश्न हिंदी में होने चाहिए
6. आसान, मध्यम और कठिन प्रश्नों का मिश्रण रखें
7. ${subjectName} विषय के मुख्य अवधारणाओं पर ध्यान दें

विषय-विशेष निर्देश:
${subjectName === 'Hindi' || subjectName === 'हिंदी' ? `
- हिंदी व्याकरण (संज्ञा, सर्वनाम, विशेषण, क्रिया)
- वर्णमाला और मात्राएं
- पर्यायवाची और विलोम शब्द
- वाक्य रचना
- कविता और कहानी से प्रश्न` : ''}
${subjectName === 'Math' || subjectName === 'गणित' ? `
- संख्याएं और गिनती
- जोड़ और घटाव
- गुणा और भाग (कक्षा के अनुसार)
- आकृतियां और पैटर्न
- माप और तौल` : ''}
${subjectName === 'English' || subjectName === 'अंग्रेज़ी' ? `
- Alphabet and phonics
- Simple vocabulary
- Basic sentences
- Common words and meanings
- Reading comprehension` : ''}
${subjectName === 'Science' || subjectName === 'विज्ञान' ? `
- पौधे और जानवर
- हमारा शरीर
- पर्यावरण
- दैनिक जीवन में विज्ञान` : ''}
${subjectName === 'Social Science' || subjectName === 'सामाजिक विज्ञान' ? `
- हमारा परिवार और समाज
- त्योहार और पर्व
- भारत का परिचय
- पर्यावरण और हम` : ''}

आपको इस exact JSON format में जवाब देना है:
{
  "questions": [
    {
      "question": "प्रश्न यहां लिखें?",
      "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
      "correct_answer": "सही विकल्प यहां",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

    const userPrompt = `${boardType} पाठ्यक्रम के अनुसार ${className} के ${subjectName} विषय के "${chapterName}" अध्याय के लिए ${numQuestions} बहुविकल्पीय प्रश्न (MCQ) बनाएं।

कृपया सुनिश्चित करें कि:
- प्रश्न ${className} के छात्रों के लिए उपयुक्त हों
- प्रश्न शैक्षिक और रोचक हों
- हर प्रश्न का एक ही सही उत्तर हो`;

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let questions;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      const parsed = JSON.parse(cleanContent);
      questions = parsed.questions;

      if (!Array.isArray(questions)) {
        throw new Error("Questions is not an array");
      }

      console.log(`Successfully generated ${questions.length} questions`);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse generated questions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ questions, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-questions-from-pdf:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
