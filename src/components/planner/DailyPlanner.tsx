
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
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Circle, 
  Plus,
  Timer,
  Coffee,
  Target
} from 'lucide-react';

interface Task {
  id: string;
  user_id: string;
  task_title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimated_time: number;
  pomodoro_sessions: number;
  is_completed: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface PomodoroSession {
  id: string;
  user_id: string;
  task_id?: string;
  session_duration: number;
  break_duration: number;
  completed_at: string;
}

const DailyPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    task_title: '',
    description: '',
    category: 'study',
    priority: 'medium' as const,
    estimated_time: 25,
    due_date: ''
  });

  // Pomodoro Timer State
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'break'>('work');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  const WORK_DURATION = 25 * 60; // 25 minutes
  const SHORT_BREAK = 5 * 60; // 5 minutes
  const LONG_BREAK = 15 * 60; // 15 minutes

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, selectedDate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_planner')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', selectedDate + 'T00:00:00')
        .lt('created_at', selectedDate + 'T23:59:59')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    }
  };

  const addTask = async () => {
    if (!user || !newTask.task_title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('daily_planner')
        .insert({
          user_id: user.id,
          task_title: newTask.task_title,
          description: newTask.description,
          category: newTask.category,
          priority: newTask.priority,
          estimated_time: newTask.estimated_time,
          due_date: newTask.due_date || null,
          is_completed: false,
          pomodoro_sessions: 0
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      setNewTask({
        task_title: '',
        description: '',
        category: 'study',
        priority: 'medium',
        estimated_time: 25,
        due_date: ''
      });
      setIsAddingTask(false);

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

  const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_planner')
        .update({ is_completed: !isCompleted })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, is_completed: !isCompleted } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const startPomodoro = (taskId?: string) => {
    setSelectedTask(taskId || null);
    setTimeRemaining(WORK_DURATION);
    setCurrentSession('work');
    setIsTimerActive(true);
  };

  const pauseTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeRemaining(currentSession === 'work' ? WORK_DURATION : SHORT_BREAK);
  };

  const handleSessionComplete = async () => {
    setIsTimerActive(false);
    
    if (currentSession === 'work') {
      setSessionCount(prev => prev + 1);
      
      // Save pomodoro session
      if (user) {
        await supabase.from('pomodoro_sessions').insert({
          user_id: user.id,
          task_id: selectedTask,
          session_duration: WORK_DURATION / 60,
          break_duration: (sessionCount + 1) % 4 === 0 ? LONG_BREAK / 60 : SHORT_BREAK / 60
        });

        // Update task pomodoro count
        if (selectedTask) {
          await supabase
            .from('daily_planner')
            .update({ 
              pomodoro_sessions: tasks.find(t => t.id === selectedTask)?.pomodoro_sessions + 1 || 1 
            })
            .eq('id', selectedTask);
        }
      }

      // Start break
      const isLongBreak = (sessionCount + 1) % 4 === 0;
      setTimeRemaining(isLongBreak ? LONG_BREAK : SHORT_BREAK);
      setCurrentSession('break');
      
      toast({
        title: 'Work Session Complete!',
        description: `Time for a ${isLongBreak ? 'long' : 'short'} break.`,
      });
    } else {
      // Break complete, back to work
      setTimeRemaining(WORK_DURATION);
      setCurrentSession('work');
      
      toast({
        title: 'Break Over!',
        description: 'Ready for another work session?',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      study: 'bg-blue-100 text-blue-800',
      work: 'bg-purple-100 text-purple-800',
      personal: 'bg-pink-100 text-pink-800',
      exercise: 'bg-green-100 text-green-800'
    };
    return colors[category as keyof typeof colors] || colors.study;
  };

  const completedTasks = tasks.filter(task => task.is_completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Planner</h1>
          <p className="text-gray-600 mt-2">Plan your day and stay productive</p>
        </div>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Daily Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Daily Progress</h3>
            <span className="text-sm text-gray-600">{completedTasks}/{totalTasks} tasks</span>
          </div>
          <Progress value={completionPercentage} className="mb-2" />
          <p className="text-sm text-gray-600">
            {completionPercentage.toFixed(0)}% complete
          </p>
        </CardContent>
      </Card>

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
            <div className="relative">
              <div className="text-6xl font-mono font-bold text-blue-600">
                {formatTime(timeRemaining)}
              </div>
              <div className="flex items-center justify-center mt-2">
                {currentSession === 'work' ? (
                  <Badge className="bg-red-100 text-red-800">
                    <Target className="h-3 w-3 mr-1" />
                    Work Session
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">
                    <Coffee className="h-3 w-3 mr-1" />
                    Break Time
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Button onClick={pauseTimer} variant="outline">
                {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button onClick={resetTimer} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              Sessions completed today: {sessionCount}
            </div>

            {selectedTask && (
              <div className="text-sm text-blue-600">
                Working on: {tasks.find(t => t.id === selectedTask)?.task_title}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Tasks</CardTitle>
              <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        value={newTask.task_title}
                        onChange={(e) => setNewTask({ ...newTask, task_title: e.target.value })}
                        placeholder="Enter task title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Task description (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="study">Study</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="exercise">Exercise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
                        <Input
                          id="estimated-time"
                          type="number"
                          value={newTask.estimated_time}
                          onChange={(e) => setNewTask({ ...newTask, estimated_time: parseInt(e.target.value) || 25 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="due-date">Due Date (optional)</Label>
                        <Input
                          id="due-date"
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={addTask} className="flex-1">Add Task</Button>
                      <Button onClick={() => setIsAddingTask(false)} variant="outline">Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks for today</h3>
                  <p className="text-gray-600 mb-4">Add your first task to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTaskComplete(task.id, task.is_completed)}
                      >
                        {task.is_completed ? 
                          <CheckCircle className="h-5 w-5 text-green-600" /> : 
                          <Circle className="h-5 w-5 text-gray-400" />
                        }
                      </Button>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                          {task.task_title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getCategoryColor(task.category)} variant="secondary">
                            {task.category}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {task.estimated_time}min
                          </span>
                          {task.pomodoro_sessions > 0 && (
                            <span className="text-xs text-blue-600">
                              🍅 {task.pomodoro_sessions}
                            </span>
                          )}
                        </div>
                      </div>

                      {!task.is_completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startPomodoro(task.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => startPomodoro()} 
                className="w-full justify-start"
                variant="outline"
              >
                <Timer className="h-4 w-4 mr-2" />
                Start Focus Session
              </Button>
              <Button 
                onClick={() => setIsAddingTask(true)} 
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add Task
              </Button>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Tasks</span>
                <span className="font-semibold">{completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pomodoro Sessions</span>
                <span className="font-semibold">{sessionCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Focus Time</span>
                <span className="font-semibold">{Math.round((sessionCount * 25) / 60 * 10) / 10}h</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
