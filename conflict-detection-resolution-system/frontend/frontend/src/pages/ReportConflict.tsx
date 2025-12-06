import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
}

const conflictTypeOptions = [
  'Resource Conflict',
  'Timing Conflict',
  'Dependency Conflict',
  'Scheduling Conflict',
  'Communication Conflict',
  'Task Overlap Conflict',
  'Overdue Conflict',
  'Custom'
];

const ReportConflict = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskId, setTaskId] = useState('');
  const [conflictType, setConflictType] = useState('Resource Conflict');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const res = await api.getTasks();
      if (res.error) {
        toast.error(res.error);
      } else {
        setTasks(res.data || []);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !description) {
      toast.error('Please select a task and enter a description');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.reportConflict({
        task_id: taskId,
        conflict_type: conflictType,
        description,
        reported_by: user?.username
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Conflict reported');
        navigate('/conflicts');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to report conflict');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report a Conflict</h1>
          <p className="text-muted-foreground mt-1">Log a conflict you have identified manually. This will appear in the conflicts list.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 bg-card border rounded-lg p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task</label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-background"
            >
              <option value="">Select a task...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Conflict Type</label>
            <select
              value={conflictType}
              onChange={(e) => setConflictType(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-background"
            >
              {conflictTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the conflict scenario..."
              className="w-full min-h-[120px] rounded-md border px-3 py-2 bg-background"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Conflict'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ReportConflict;