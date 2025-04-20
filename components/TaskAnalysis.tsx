import { useState } from 'react';
import { analyzeTasks } from '@/lib/ai-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Task {
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  completed: boolean;
}

export function TaskAnalysis({ tasks }: { tasks: Task[] }) {
  const [analysis, setAnalysis] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeTasks(tasks);
      setAnalysis(result.response);
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Error analyzing tasks:', error);
      setAnalysis('Failed to analyze tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Task Analysis</CardTitle>
        <CardDescription>
          Get AI-powered insights about your tasks and suggestions for better productivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="w-full mb-4"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Tasks'
          )}
        </Button>

        {analysis && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Analysis</h3>
              <p className="whitespace-pre-wrap">{analysis}</p>
            </div>

            {suggestions.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Suggestions</h3>
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