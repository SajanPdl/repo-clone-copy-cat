
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    
    console.log('Received request:', { messages, mode });

    // Check if API key is available
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not set');
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    
    console.log('API key is available, length:', geminiApiKey.length);

    const systemPrompts = {
      chat: "You are a helpful AI study assistant. Provide clear, educational responses to help students learn. Be encouraging and thorough in your explanations.",
      explain: "You are an expert teacher. Break down complex topics into simple, easy-to-understand explanations. Use analogies and examples when helpful.",
      quiz: "You are a quiz generator. Create relevant questions based on the topic provided. After each question, wait for the student's answer before providing the next question.",
      flashcard: "You are a flashcard creator. Generate clear, concise flashcards in the format 'Front: [question] | Back: [answer]' for the topic provided."
    };

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.chat;

    // Combine all messages into a single prompt for Gemini
    const conversationText = messages.map((msg: any) => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const fullPrompt = `${systemPrompt}\n\n${conversationText}`;
    
    console.log('Sending request to Gemini with prompt length:', fullPrompt.length);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
