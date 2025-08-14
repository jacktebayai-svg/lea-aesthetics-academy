import { GoogleGenAI, Content, Part } from '@google/genai';
import { NextRequest } from 'next/server';

function mapHistoryToContent(history: {role: 'user' | 'assistant', text: string}[]): Content[] {
    const content: Content[] = [];
    for (const item of history) {
        content.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }] as Part[],
        });
    }
    return content;
}


export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!process.env.API_KEY) {
      return new Response('API key not found.', { status: 500 });
    }
    
    if (!message) {
      return new Response('Message is required.', { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "You are a helpful and encouraging tutor for Lea's Aesthetics Clinical Academy. Your students are medical professionals. Answer their questions about aesthetic medicine clearly, concisely, and professionally. Always be supportive.",
        },
        history: mapHistoryToContent(history || [])
    });

    const stream = await chat.sendMessageStream({ message });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
                controller.enqueue(new TextEncoder().encode(text));
            }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
}
