import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Task, ConflictReport } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conflicts, setConflicts] = useState<ConflictReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, storedConflictsRes] = await Promise.all([
        api.getTasks(),
        api.getConflicts(), // use stored conflicts not detection run
      ]);
      if (tasksRes.data) setTasks(tasksRes.data as Task[]);
      if (storedConflictsRes.data) {
        const list = Array.isArray(storedConflictsRes.data) ? storedConflictsRes.data : [];
        // client-side deduplication
        const unique = new Map<string, any>();
        for (const c of list) {
          const key = `${c.task_id}|${c.conflict_type}|${c.description}`;
          if (!unique.has(key)) unique.set(key, c);
        }
        setConflicts(Array.from(unique.values()));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const runDetection = async () => {
    setIsLoading(true);
    try {
      const detectionRes = await api.detectConflicts();
      if (detectionRes.data) {
        const payload = detectionRes.data as any;
        const detected = payload.conflicts || [];
        toast.success(`Detected ${detected.length} conflicts (dedup applied)`);
      } else if (detectionRes.error) {
        toast.error(detectionRes.error);
      }
      // After detection, reload stored conflicts
      await refreshData();
    } catch (e: any) {
      toast.error(e.message || 'Detection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    conflicts: conflicts.filter(c => !c.resolved).length,
  };

  const getConflictColor = (type: string) => {
    switch (type) {
      case 'resource': return 'destructive';
      case 'dependency': return 'warning';
      case 'schedule': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of tasks and conflict status (stored conflicts)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={isLoading} onClick={refreshData}>Refresh</Button>
          <Button disabled={isLoading} onClick={runDetection}>Run Detection</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Conflicts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conflicts}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conflicts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Conflicts</CardTitle>
            <CardDescription>
              Latest detected conflicts requiring resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading conflicts...</p>
            ) : conflicts.filter(c => !c.resolved).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-lg font-medium">No conflicts detected!</p>
                <p className="text-sm text-muted-foreground">All tasks are conflict-free</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conflicts.filter(c => !c.resolved).slice(0, 5).map((conflict) => (
                  <div
                    key={conflict.id}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getConflictColor(conflict.conflict_type) as any}>
                          {conflict.conflict_type}
                        </Badge>
                        {!conflict.resolved && (
                          <Badge variant="outline" className="text-destructive border-destructive">
                            Unresolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{conflict.description}</p>
                      {conflict.resolution_suggestion && (
                        <p className="text-sm text-muted-foreground mt-1">
                          💡 {conflict.resolution_suggestion}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Task ID: {conflict.task_id} {conflict.detected_on ? `• Detected: ${new Date(conflict.detected_on).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
            <CardDescription>
              Quick view of task assignments and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 8).map((task) => {
                  const hasConflict = conflicts.some(c => c.task_id === task.id && !c.resolved);
                  
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        hasConflict 
                          ? 'bg-destructive/5 border-destructive/20' 
                          : 'bg-success/5 border-success/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {hasConflict ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {task.assigned_to}
                          </p>
                        </div>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
