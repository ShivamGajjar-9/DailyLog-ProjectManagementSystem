import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Using Ollama API (local AI model)
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral', // You can change this to other models like 'llama2' or 'codellama'
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    
    // Parse the response to extract suggestions
    const responseText = data.response;
    const suggestions = responseText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(1).trim());

    return NextResponse.json({
      response: responseText,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    });
  } catch (error) {
    console.error('Error in AI route:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
} 