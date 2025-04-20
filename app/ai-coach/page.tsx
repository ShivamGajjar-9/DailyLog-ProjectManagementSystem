import { TaskAnalysis } from '@/components/TaskAnalysis';
import { TaskReflection } from '@/components/TaskReflection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Example tasks data - replace with your actual data
const exampleTasks = [
  { 
    title: 'Complete project proposal', 
    status: 'IN_PROGRESS', 
    priority: 'HIGH',
    dueDate: '2024-04-15',
    completed: false
  },
  { 
    title: 'Review code changes', 
    status: 'TODO', 
    priority: 'MEDIUM',
    dueDate: '2024-04-12',
    completed: false
  },
  { 
    title: 'Schedule team meeting', 
    status: 'COMPLETED', 
    priority: 'LOW',
    dueDate: '2024-04-11',
    completed: true
  },
  { 
    title: 'Update documentation', 
    status: 'BACKLOG', 
    priority: 'LOW',
    dueDate: '2024-04-20',
    completed: false
  },
];

export default function AICoachPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Task Manager AI Assistant</h1>
        <p className="text-muted-foreground">
          Get personalized insights and suggestions for your task management and productivity
        </p>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Task Analysis</TabsTrigger>
          <TabsTrigger value="reflection">Task Reflection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis" className="mt-6">
          <TaskAnalysis tasks={exampleTasks} />
        </TabsContent>
        
        <TabsContent value="reflection" className="mt-6">
          <TaskReflection />
        </TabsContent>
      </Tabs>
    </div>
  );
} 