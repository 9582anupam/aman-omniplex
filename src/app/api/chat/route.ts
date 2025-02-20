import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { ChatCompletionMessage } from 'openai/resources/chat';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Ask OpenAI for a streaming chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: messages as ChatCompletionMessage[],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response as any); // Type assertion as workaround

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('[Chat API Error]:', error);
    return new Response(
      JSON.stringify({ error: 'There was an error processing your request' }), 
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
