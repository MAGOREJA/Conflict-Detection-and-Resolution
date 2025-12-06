// import { useEffect, useState } from 'react';
// import Layout from '@/components/Layout';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
// import { Task } from '@/types';
// import { api } from '@/lib/api';
// import { toast } from 'sonner';

// const Tasks = () => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [formData, setFormData] = useState({
//     title: '',
//     assigned_to: '',
//     start_time: '',
//     end_time: '',
//     status: 'pending' as Task['status'],
//     resource: '',
//   });

//   useEffect(() => {
//     loadTasks();
//   }, []);

//   const loadTasks = async () => {
//     const response = await api.getTasks();
//     if (response.data) {
//       setTasks(response.data as Task[]);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const taskData = {
//       ...formData,
//       dependencies: [],
//     };

//     if (editingTask) {
//       const response = await api.updateTask(editingTask.id, taskData);
//       if (response.error) {
//         toast.error(response.error);
//       } else {
//         toast.success('Task updated successfully');
//         loadTasks();
//       }
//     } else {
//       const response = await api.createTask(taskData);
//       if (response.error) {
//         toast.error(response.error);
//       } else {
//         toast.success('Task created successfully');
//         loadTasks();
//       }
//     }

//     setIsOpen(false);
//     resetForm();
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this task?')) return;
    
//     const response = await api.deleteTask(id);
//     if (response.error) {
//       toast.error(response.error);
//     } else {
//       toast.success('Task deleted successfully');
//       loadTasks();
//     }
//   };

//   const handleEdit = (task: Task) => {
//     setEditingTask(task);
//     setFormData({
//       title: task.title,
//       assigned_to: task.assigned_to,
//       start_time: task.start_time,
//       end_time: task.end_time,
//       status: task.status,
//       resource: task.resource || '',
//     });
//     setIsOpen(true);
//   };

//   const resetForm = () => {
//     setEditingTask(null);
//     setFormData({
//       title: '',
//       assigned_to: '',
//       start_time: '',
//       end_time: '',
//       status: 'pending',
//       resource: '',
//     });
//   };

//   const getStatusColor = (status: Task['status']) => {
//     switch (status) {
//       case 'completed': return 'default';
//       case 'in_progress': return 'secondary';
//       case 'pending': return 'outline';
//     }
//   };

//   return (
//     <Layout>
//       <div className="container mx-auto p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
//             <p className="text-muted-foreground mt-1">
//               Manage all team tasks and assignments
//             </p>
//           </div>
          
//           <Dialog open={isOpen} onOpenChange={(open) => {
//             setIsOpen(open);
//             if (!open) resetForm();
//           }}>
//             <DialogTrigger asChild>
//               <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Task
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
//                 <DialogDescription>
//                   {editingTask ? 'Update task details' : 'Add a new task to the system'}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="col-span-2 space-y-2">
//                     <Label htmlFor="title">Task Title</Label>
//                     <Input
//                       id="title"
//                       placeholder="Enter task title"
//                       value={formData.title}
//                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="assigned_to">Assigned To</Label>
//                     <Input
//                       id="assigned_to"
//                       placeholder="Team member name"
//                       value={formData.assigned_to}
//                       onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="resource">Resource</Label>
//                     <Input
//                       id="resource"
//                       placeholder="Required resource"
//                       value={formData.resource}
//                       onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="start_time">Start Time</Label>
//                     <Input
//                       id="start_time"
//                       type="datetime-local"
//                       value={formData.start_time}
//                       onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="end_time">End Time</Label>
//                     <Input
//                       id="end_time"
//                       type="datetime-local"
//                       value={formData.end_time}
//                       onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="col-span-2 space-y-2">
//                     <Label htmlFor="status">Status</Label>
//                     <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="pending">Pending</SelectItem>
//                         <SelectItem value="in_progress">In Progress</SelectItem>
//                         <SelectItem value="completed">Completed</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="flex gap-2 justify-end">
//                   <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit">
//                     {editingTask ? 'Update Task' : 'Create Task'}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>All Tasks</CardTitle>
//             <CardDescription>Complete list of tasks in the system</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {tasks.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-muted-foreground mb-4">No tasks yet</p>
//                 <Button onClick={() => setIsOpen(true)} variant="outline">
//                   Create your first task
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {tasks.map((task) => (
//                   <div
//                     key={task.id}
//                     className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
//                   >
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <h3 className="font-semibold">{task.title}</h3>
//                         <Badge variant={getStatusColor(task.status)}>
//                           {task.status.replace('_', ' ')}
//                         </Badge>
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
//                         <p>👤 {task.assigned_to}</p>
//                         {task.resource && <p>📦 {task.resource}</p>}
//                         <p className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           {new Date(task.start_time).toLocaleDateString()}
//                         </p>
//                         <p className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           {new Date(task.end_time).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleEdit(task)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleDelete(task.id)}
//                         className="text-destructive hover:text-destructive"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// };

// export default Tasks;




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Layout from "@/components/Layout";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
// import { Task } from "@/types";
// import { api } from "@/lib/api";
// import { toast } from "sonner";

// const Tasks = () => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     assigned_to: "",
//     start_time: "",
//     end_time: "",
//     status: "pending" as Task["status"],
//     resource: "",
//   });

//   const { id } = useParams(); // 👈 task id from URL
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadTasks();
//   }, []);

//   // Automatically open the edit dialog if navigated from conflict resolution
//   useEffect(() => {
//     if (id && tasks.length > 0) {
//       const taskToEdit = tasks.find((t) => t.id === id);
//       if (taskToEdit) handleEdit(taskToEdit);
//       else toast.error("Task not found");
//     }
//   }, [id, tasks]);

//   const loadTasks = async () => {
//     const response = await api.getTasks();
//     if (response.data) {
//       setTasks(response.data as Task[]);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const taskData = {
//       ...formData,
//       dependencies: [],
//     };

//     if (editingTask) {
//       const response = await api.updateTask(editingTask.id, taskData);
//       if (response.error) {
//         toast.error(response.error);
//       } else {
//         toast.success("Task updated successfully");
//         loadTasks();
//       }
//     } else {
//       const response = await api.createTask(taskData);
//       if (response.error) {
//         toast.error(response.error);
//       } else {
//         toast.success("Task created successfully");
//         loadTasks();
//       }
//     }

//     setIsOpen(false);
//     resetForm();
//     navigate("/tasks"); // 👈 return to tasks list view
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this task?")) return;

//     const response = await api.deleteTask(id);
//     if (response.error) {
//       toast.error(response.error);
//     } else {
//       toast.success("Task deleted successfully");
//       loadTasks();
//     }
//   };

//   const handleEdit = (task: Task) => {
//     setEditingTask(task);
//     setFormData({
//       title: task.title,
//       assigned_to: task.assigned_to,
//       start_time: task.start_time,
//       end_time: task.end_time,
//       status: task.status,
//       resource: task.resource || "",
//     });
//     setIsOpen(true);
//   };

//   const resetForm = () => {
//     setEditingTask(null);
//     setFormData({
//       title: "",
//       assigned_to: "",
//       start_time: "",
//       end_time: "",
//       status: "pending",
//       resource: "",
//     });
//   };

//   const getStatusColor = (status: Task["status"]) => {
//     switch (status) {
//       case "completed":
//         return "default";
//       case "in_progress":
//         return "secondary";
//       case "pending":
//         return "outline";
//     }
//   };

//   return (
//     <Layout>
//       <div className="container mx-auto p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
//             <p className="text-muted-foreground mt-1">
//               Manage all team tasks and assignments
//             </p>
//           </div>

//           <Dialog
//             open={isOpen}
//             onOpenChange={(open) => {
//               setIsOpen(open);
//               if (!open) {
//                 resetForm();
//                 navigate("/tasks"); // 👈 Reset route if closed
//               }
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Task
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingTask ? "Edit Task" : "Create New Task"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {editingTask
//                     ? "Update task details"
//                     : "Add a new task to the system"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="col-span-2 space-y-2">
//                     <Label htmlFor="title">Task Title</Label>
//                     <Input
//                       id="title"
//                       placeholder="Enter task title"
//                       value={formData.title}
//                       onChange={(e) =>
//                         setFormData({ ...formData, title: e.target.value })
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="assigned_to">Assigned To</Label>
//                     <Input
//                       id="assigned_to"
//                       placeholder="Team member name"
//                       value={formData.assigned_to}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           assigned_to: e.target.value,
//                         })
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="resource">Resource</Label>
//                     <Input
//                       id="resource"
//                       placeholder="Required resource"
//                       value={formData.resource}
//                       onChange={(e) =>
//                         setFormData({ ...formData, resource: e.target.value })
//                       }
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="start_time">Start Time</Label>
//                     <Input
//                       id="start_time"
//                       type="datetime-local"
//                       value={formData.start_time}
//                       onChange={(e) =>
//                         setFormData({ ...formData, start_time: e.target.value })
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="end_time">End Time</Label>
//                     <Input
//                       id="end_time"
//                       type="datetime-local"
//                       value={formData.end_time}
//                       onChange={(e) =>
//                         setFormData({ ...formData, end_time: e.target.value })
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="col-span-2 space-y-2">
//                     <Label htmlFor="status">Status</Label>
//                     <Select
//                       value={formData.status}
//                       onValueChange={(value: Task["status"]) =>
//                         setFormData({ ...formData, status: value })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="pending">Pending</SelectItem>
//                         <SelectItem value="in_progress">In Progress</SelectItem>
//                         <SelectItem value="completed">Completed</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="flex gap-2 justify-end">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => {
//                       setIsOpen(false);
//                       navigate("/tasks");
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit">
//                     {editingTask ? "Update Task" : "Create Task"}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>All Tasks</CardTitle>
//             <CardDescription>
//               Complete list of tasks in the system
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {tasks.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-muted-foreground mb-4">No tasks yet</p>
//                 <Button onClick={() => setIsOpen(true)} variant="outline">
//                   Create your first task
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {tasks.map((task) => (
//                   <div
//                     key={task.id}
//                     className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
//                   >
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <h3 className="font-semibold">{task.title}</h3>
//                         <Badge variant={getStatusColor(task.status)}>
//                           {task.status.replace("_", " ")}
//                         </Badge>
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
//                         <p>👤 {task.assigned_to}</p>
//                         {task.resource && <p>📦 {task.resource}</p>}
//                         <p className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           {new Date(task.start_time).toLocaleDateString()}
//                         </p>
//                         <p className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           {new Date(task.end_time).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleEdit(task)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleDelete(task.id)}
//                         className="text-destructive hover:text-destructive"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// };

// export default Tasks;




import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { Task } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    assigned_to: "",
    start_time: "",
    end_time: "",
    status: "pending" as Task["status"],
    resource: "",
  });

  const { id } = useParams(); // 👈 task id from URL
  const navigate = useNavigate();

  // Load tasks initially
  useEffect(() => {
    loadTasks();
  }, []);

  // Automatically open task dialog if navigated via URL
  useEffect(() => {
    if (id && tasks.length > 0) {
      const taskToEdit = tasks.find((t) => t.id === id);
      if (taskToEdit) handleEdit(taskToEdit);
      else toast.error("Task not found");
    }
  }, [id, tasks]);

  // Listen for conflict resolution events
  useEffect(() => {
    const handleOpenFromConflict = (e: any) => {
      const taskId = e.detail.taskId;
      const taskToEdit = tasks.find((t) => t.id === taskId);
      if (taskToEdit) handleEdit(taskToEdit);
      else toast.error("Task not found");
    };

    window.addEventListener("openTaskEditDialog", handleOpenFromConflict);
    return () =>
      window.removeEventListener("openTaskEditDialog", handleOpenFromConflict);
  }, [tasks]);

  const loadTasks = async () => {
    const response = await api.getTasks();
    if (response.data) {
      setTasks(response.data as Task[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      dependencies: [],
    };

    if (editingTask) {
      const response = await api.updateTask(editingTask.id, taskData);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Task updated successfully");
        loadTasks();
      }
    } else {
      const response = await api.createTask(taskData);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Task created successfully");
        loadTasks();
      }
    }

    setIsOpen(false);
    resetForm();
    navigate("/tasks"); // Reset route
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const response = await api.deleteTask(id);
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success("Task deleted successfully");
      loadTasks();
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      assigned_to: task.assigned_to,
      start_time: task.start_time,
      end_time: task.end_time,
      status: task.status,
      resource: task.resource || "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      assigned_to: "",
      start_time: "",
      end_time: "",
      status: "pending",
      resource: "",
    });
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage all team tasks and assignments
            </p>
          </div>

          {/* Task Dialog */}
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                resetForm();
                navigate("/tasks");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Create New Task"}
                </DialogTitle>
                <DialogDescription>
                  {editingTask
                    ? "Update task details"
                    : "Add a new task to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter task title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                      id="assigned_to"
                      placeholder="Team member name"
                      value={formData.assigned_to}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assigned_to: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource">Resource</Label>
                    <Input
                      id="resource"
                      placeholder="Required resource"
                      value={formData.resource}
                      onChange={(e) =>
                        setFormData({ ...formData, resource: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="status">Status</Label>
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
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/tasks");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTask ? "Update Task" : "Create Task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Complete list of tasks in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No tasks yet</p>
                <Button onClick={() => setIsOpen(true)} variant="outline">
                  Create your first task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>👤 {task.assigned_to}</p>
                        {task.resource && <p>📦 {task.resource}</p>}
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.start_time).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.end_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Tasks;
