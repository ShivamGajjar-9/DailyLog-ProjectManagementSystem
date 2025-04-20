import { z } from "zod";

const aiResponseSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()).optional(),
});

export type AIResponse = z.infer<typeof aiResponseSchema>;

export async function getAIResponse(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return aiResponseSchema.parse(data);
  } catch (error) {
    console.error('Error getting AI response:', error);
    return {
      response: "I'm having trouble processing your request right now. Please try again later.",
      suggestions: ["Try rephrasing your question", "Check your internet connection"]
    };
  }
}

export async function analyzeTasks(tasks: Array<{ 
  title: string; 
  status: string; 
  priority: string;
  dueDate: string;
  completed: boolean;
}>) {
  const prompt = `Analyze these tasks and provide insights:
    ${JSON.stringify(tasks)}
    
    Please provide:
    1. A summary of task completion and progress
    2. Areas that need attention (overdue tasks, high priority items)
    3. Specific suggestions for better task management and productivity`;

  return getAIResponse(prompt);
}

export async function getTaskReflectionResponse(reflection: string) {
  const prompt = `Analyze this task management reflection and provide supportive feedback:
    "${reflection}"
    
    Please provide:
    1. A summary of your task management approach
    2. Recognition of completed tasks and progress
    3. Encouraging suggestions for better task organization and productivity`;

  return getAIResponse(prompt);
} 