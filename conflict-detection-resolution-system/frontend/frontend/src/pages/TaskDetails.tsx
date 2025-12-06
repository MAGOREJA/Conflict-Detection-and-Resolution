// // src/pages/TaskDetails.tsx
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import { Task } from "@/types";

// const TaskDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [task, setTask] = useState<Task | null>(null);

//   useEffect(() => {
//     loadTask();
//   }, []);

//   const loadTask = async () => {
//     const response = await api.getTask(id!);
//     if (response.data) {
//       setTask(response.data as Task);
//     } else {
//       toast.error(response.error || "Failed to load task");
//     }
//   };

//   if (!task) return <Layout><p className="p-6">Loading...</p></Layout>;

//   return (
//     <Layout>
//       <div className="container mx-auto p-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>{task.title}</CardTitle>
//             <CardDescription>
//               Assigned to: {task.assigned_to} | Status: {task.status}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <p><strong>Start:</strong> {new Date(task.start_time).toLocaleString()}</p>
//             <p><strong>End:</strong> {new Date(task.end_time).toLocaleString()}</p>
//             {task.resource && <p><strong>Resource:</strong> {task.resource}</p>}

//             <Button onClick={() => navigate("/tasks")} variant="outline">
//               Back to Tasks
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// };

// export default TaskDetails;


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  assigned_to: string;
  status: "pending" | "in_progress" | "completed";
  resource?: string;
}

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    resource: "",
    start_time: "",
    end_time: "",
    status: "pending" as Task["status"],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.getTaskById(id!);
        if (response.error) toast.error(response.error);
        else {
          setTask(response.data);
          setFormData({
            title: response.data.title,
            description: response.data.description,
            assigned_to: response.data.assigned_to,
            resource: response.data.resource || "",
            start_time: response.data.start_time,
            end_time: response.data.end_time,
            status: response.data.status,
          });
        }
      } catch {
        toast.error("Failed to fetch task");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updatedTask = { ...task, ...formData };
      const response = await api.updateTask(task.id, updatedTask);
      if (response.error) toast.error(response.error);
      else {
        toast.success("Task updated successfully");
        navigate("/tasks"); // Go back to tasks list after save
      }
    } catch {
      toast.error("Error updating task");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!task) return <p className="p-6 text-destructive">Task not found.</p>;

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Task — {task.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Resource</Label>
              <Input
                value={formData.resource}
                onChange={(e) =>
                  setFormData({ ...formData, resource: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Task["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => navigate("/tasks")}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
