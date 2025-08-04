
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  Circle,
  Timer
} from 'lucide-react';

interface Task {
  id: string;
  task_title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  is_completed: boolean;
  estimated_time?: number;
  pomodoro_sessions: number;
  created_at: string;
}

interface PomodoroSession {
  isActive: boolean;
  minutes: number;
  seconds: number;
  isBreak: boolean;
  sessionCount: number;
}

const DailyPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    task_title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
    category: 'study',
    estimated_time: 25
  });

  const [pomodoro, setPomodoro] = useState<PomodoroSession>({
    isActive: false,
    minutes: 25,
    seconds: 0,
    isBreak: false,
    sessionCount: 0
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (pomodoro.isActive) {
      interval = setInterval(() => {
        setPomodoro(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer finished
            const isBreak = !prev.isBreak;
            const newSessionCount = isBreak ? prev.sessionCount : prev.sessionCount + 1;
            const breakDuration = newSessionCount % 4 === 0 ? 15 : 5; // Long break every 4 sessions
            
            toast({
              title: isBreak ? 'Work Session Complete!' : 'Break Time Over!',
              description: isBreak 
                ? `Take a ${breakDuration} minute break` 
                : 'Ready for your next work session'
            });
            
            return {
              ...prev,
              isActive: false,
              minutes: isBreak ? breakDuration : 25,
              seconds: 0,
              isBreak,
              sessionCount: newSessionCount
            };
          }
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isActive, toast]);

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Mock data for now since daily_planner table isn't in types yet
      const mockTasks: Task[] = [
        {
          id: '1',
          task_title: 'Review Mathematics Chapter 5',
          description: 'Complete exercises 1-20',
          due_date: new Date().toISOString(),
          priority: 'high',
          category: 'study',
          is_completed: false,
          estimated_time: 50,
          pomodoro_sessions: 2,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          task_title: 'Prepare Physics Lab Report',
          priority: 'medium',
          category: 'assignment',
          is_completed: true,
          estimated_time: 25,
          pomodoro_sessions: 1,
          created_at: new Date().toISOString()
        }
      ];
      
      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!user || !newTask.task_title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a task title',
        variant: 'destructive'
      });
      return;
    }

    try {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        is_completed: false,
        pomodoro_sessions: 0,
        created_at: new Date().toISOString()
      };

      setTasks(prev => [task, ...prev]);
      setNewTask({
        task_title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'study',
        estimated_time: 25
      });
      setShowAddTask(false);

      toast({
        title: 'Success',
        description: 'Task added successfully',
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task',
        variant: 'destructive'
      });
    }
  };

  const toggleTask = async (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, is_completed: !task.is_completed }
        : task
    ));
  };

  const startPomodoro = () => {
    setPomodoro(prev => ({ ...prev, isActive: true }));
  };

  const pausePomodoro = () => {
    setPomodoro(prev => ({ ...prev, isActive: false }));
  };

  const resetPomodoro = () => {
    setPomodoro({
      isActive: false,
      minutes: 25,
      seconds: 0,
      isBreak: false,
      sessionCount: 0
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Daily Planner</h1>
        <p className="text-gray-600 mt-2">Plan your study sessions with Pomodoro technique</p>
      </div>

      {/* Pomodoro Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Pomodoro Timer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-mono font-bold text-blue-600">
              {formatTime(pomodoro.minutes, pomodoro.seconds)}
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Badge variant={pomodoro.isBreak ? 'secondary' : 'default'}>
                {pomodoro.isBreak ? 'Break Time' : 'Work Session'}
              </Badge>
              <Badge variant="outline">
                Sessions: {pomodoro.sessionCount}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              {!pomodoro.isActive ? (
                <Button onClick={startPomodoro} className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Start</span>
                </Button>
              ) : (
                <Button onClick={pausePomodoro} variant="outline" className="flex items-center space-x-2">
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </Button>
              )}
              <Button onClick={resetPomodoro} variant="outline" className="flex items-center space-x-2">
                <Square className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today's Tasks</h2>
        <Button onClick={() => setShowAddTask(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.task_title}
                onChange={(e) => setNewTask(prev => ({ ...prev, task_title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam Prep</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
                <Input
                  id="estimated-time"
                  type="number"
                  value={newTask.estimated_time}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 25 }))}
                  min="5"
                  max="120"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={newTask.due_date}
                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={addTask}>Add Task</Button>
              <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-gray-600">Add your first task to get started!</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className={`${task.is_completed ? 'opacity-75' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTask(task.id)}
                      className="mt-1"
                    >
                      {task.is_completed ? 
                        <CheckCircle className="h-5 w-5 text-green-600" /> : 
                        <Circle className="h-5 w-5" />
                      }
                    </Button>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                        {task.task_title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.category}</Badge>
                        
                        {task.estimated_time && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimated_time}m</span>
                          </div>
                        )}
                        
                        {task.pomodoro_sessions > 0 && (
                          <Badge variant="secondary">
                            {task.pomodoro_sessions} sessions
                          </Badge>
                        )}
                      </div>
                      
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(task.due_date).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyPlanner;
