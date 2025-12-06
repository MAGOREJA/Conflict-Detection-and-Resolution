import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ConflictReport {
  id: string;
  task_id: string;
  conflict_type: string;
  description: string;
  resolution_suggestion?: string;
  suggested_actions?: string[];
  resolved?: boolean;
  detected_on?: string;
  reported_by?: string;
}

const Conflicts = () => {
  const [conflicts, setConflicts] = useState<ConflictReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // ✅ For navigation

  // On mount, load existing stored conflicts (including manual reports)
  useEffect(() => {
    loadStoredConflicts();
  }, []);

  const loadStoredConflicts = async () => {
    setIsLoading(true);
    try {
      const response = await api.getConflicts();
      if (response.data) {
        // API returns an array of conflicts
        const list = Array.isArray(response.data) ? response.data : [];
        // Deduplicate client-side by natural key (task_id|conflict_type|description)
        const uniqueMap = new Map<string, any>();
        for (const c of list) {
          const key = `${c.task_id}|${c.conflict_type}|${c.description}`;
          if (!uniqueMap.has(key)) uniqueMap.set(key, c);
        }
        setConflicts(Array.from(uniqueMap.values()) as any);
      } else {
        toast.error(response.error || 'Failed to load conflicts');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load conflicts');
    } finally {
      setIsLoading(false);
    }
  };

  const detectConflicts = async () => {
    setIsLoading(true);
    try {
      const response = await api.detectConflicts();
      if (response.data) {
        const payload = response.data as any;
        const detected = payload.conflicts || [];
        toast.success(`Detected ${detected.length} new conflicts`);
        // After detection, refresh full list from DB so manual + detected coexist
        await loadStoredConflicts();
      } else {
        toast.error(response.error || 'Error during detection');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to detect conflicts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const response = await api.resolveConflict(id, { resolved: true });
      if (response.error) toast.error(response.error);
      else {
        toast.success('Conflict resolved');
        detectConflicts();
      }
    } catch (err: any) {
      toast.error(err.message || 'Error resolving conflict');
    }
  };

  const getConflictColor = (type: string) => {
    if (type.toLowerCase().includes('resource')) return 'destructive';
    if (type.toLowerCase().includes('timing')) return 'warning';
    if (type.toLowerCase().includes('dependency')) return 'default';
    if (type.toLowerCase().includes('role')) return 'secondary';
    if (type.toLowerCase().includes('data')) return 'accent';
    return 'outline';
  };

  const unresolvedConflicts = conflicts.filter((c) => !c.resolved);
  const resolvedConflicts = conflicts.filter((c) => c.resolved);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conflict Detection</h1>
            <p className="text-muted-foreground mt-1">
              Automatically detected conflicts across resources, tasks, and dependencies.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadStoredConflicts}
              variant="secondary"
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              onClick={detectConflicts}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Detecting...' : 'Run Detection'}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Total Conflicts</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{conflicts.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{unresolvedConflicts.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-success">{resolvedConflicts.length}</div></CardContent>
          </Card>
        </div>

        {/* Active Conflicts */}
        {unresolvedConflicts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Active Conflicts
              </CardTitle>
              <CardDescription>Detected issues that need attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {unresolvedConflicts.map((conflict) => (
                <div key={conflict.id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={getConflictColor(conflict.conflict_type) as any}>
                        {conflict.conflict_type}
                      </Badge>
                      <h3 className="font-semibold mt-2">{conflict.description}</h3>
                      {conflict.resolution_suggestion && (
                        <p className="text-sm text-primary mt-2">
                          💡 {conflict.resolution_suggestion}
                        </p>
                      )}
                      {conflict.suggested_actions && conflict.suggested_actions.length > 0 && (
                        <ul className="list-disc ml-5 mt-2 text-sm text-muted-foreground">
                          {conflict.suggested_actions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      )}
                    </div>

                    {/* ✅ Updated Button */}
                    <Button
                      onClick={() => {
                        handleResolve(conflict.id);
                        navigate(`/tasks/${conflict.task_id}`); // ✅ Go to that specific task
                      }}
                      size="sm"
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Resolved Conflicts */}
        {resolvedConflicts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" /> Resolved Conflicts
              </CardTitle>
              <CardDescription>Conflicts that have been addressed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resolvedConflicts.map((conflict) => (
                <div key={conflict.id} className="p-4 rounded-lg border border-success/20 bg-success/5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <div>
                      <Badge variant="outline" className="border-success text-success">
                        {conflict.conflict_type}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{conflict.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Task: {conflict.task_id} • Resolved
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {conflicts.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-success mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Conflicts Detected</h3>
              <p className="text-muted-foreground text-center">
                All tasks are conflict-free! Click “Run Detection” to recheck.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Conflicts;
