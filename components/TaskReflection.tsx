import { useState } from 'react';
import { getTaskReflectionResponse } from '@/lib/ai-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function TaskReflection() {
  const [reflection, setReflection] = useState('');
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reflection.trim()) return;
    
    setLoading(true);
    try {
      const result = await getTaskReflectionResponse(reflection);
      setResponse(result.response);
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Error getting task reflection response:', error);
      setResponse('Failed to process your reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Task Management Reflection</CardTitle>
        <CardDescription>
          Share your thoughts on your task management approach and get AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="How did you manage your tasks today? What worked well? What challenges did you face? How do you feel about your productivity?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="min-h-[100px]"
        />
        
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !reflection.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Get Task Insights'
          )}
        </Button>

        {response && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">AI Response</h3>
              <p className="whitespace-pre-wrap">{response}</p>
            </div>

            {suggestions.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Productivity Suggestions</h3>
                <ul className="list-disc pl-4 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 