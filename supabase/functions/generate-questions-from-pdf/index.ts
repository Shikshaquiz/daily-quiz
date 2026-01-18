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
    
    console.log("Generating questions from PDF:", { pdfUrl, chapterName, subjectName, className, numQuestions });

    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: "PDF URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch PDF content
    console.log("Fetching PDF from:", pdfUrl);
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      console.error("Failed to fetch PDF:", pdfResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to fetch PDF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
    
    console.log("PDF fetched successfully, size:", pdfArrayBuffer.byteLength);

    const systemPrompt = `You are an expert educational content creator specializing in creating objective multiple-choice questions (MCQs) from educational materials. 

Your task is to analyze the provided PDF content and generate high-quality quiz questions for students.

Rules:
1. Generate exactly ${numQuestions} questions
2. Each question must have exactly 4 options
3. Questions should be based ONLY on the content in the PDF
4. Questions should test understanding, not just memorization
5. Mix easy, medium, and hard difficulty levels
6. Make questions age-appropriate for ${className}
7. Focus on key concepts from the ${chapterName} chapter in ${subjectName}
8. Questions should be in Hindi or simple Hindi-English mix for Indian students
9. Ensure all questions have exactly one correct answer

You MUST respond with a JSON object containing an array of questions in this exact format:
{
  "questions": [
    {
      "question": "प्रश्न यहां लिखें?",
      "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
      "correct_answer": "सही विकल्प",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

    const userPrompt = `Please analyze this PDF document for ${className} ${subjectName} - ${chapterName} and generate ${numQuestions} multiple choice questions based on its content.`;

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
          { 
            role: "user", 
            content: [
              { type: "text", text: userPrompt },
              { 
                type: "image_url", 
                image_url: { 
                  url: `data:application/pdf;base64,${pdfBase64}` 
                } 
              }
            ]
          }
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

      console.log(`Successfully parsed ${questions.length} questions`);
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