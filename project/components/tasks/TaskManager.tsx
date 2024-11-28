import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  assignedTo: {
    id: string;
    name: string;
  };
  tags?: { id: string; name: string }[];
}

interface TaskManagerProps {
  userId: string;
  userRole: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ userId, userRole }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedToId: userId,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'todo' as 'todo' | 'in_progress' | 'review' | 'done',
    dueDate: null as Date | null
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?assignedToId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setTasks(result.data.tasks);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTask,
          dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        setTasks([...tasks, result.data]);
        setOpenCreateTask(false);
        setNewTask({
          title: '',
          description: '',
          assignedToId: userId,
          priority: 'medium',
          status: 'todo',
          dueDate: null
        });
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          status: newStatus
        })
      });

      const result = await response.json();

      if (result.success) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      } else {
        console.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'info';
    }
  };

  if (loading) {
    return <Typography>Loading tasks...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs>
            <Typography variant="h4">Task Management</Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setOpenCreateTask(true)}
            >
              Create Task
            </Button>
          </Grid>
        </Grid>

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority} 
                        color={getPriorityColor(task.priority)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                        size="small"
                      >
                        <MenuItem value="todo">To Do</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="review">Review</MenuItem>
                        <MenuItem value="done">Done</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </TableCell>
                    <TableCell>
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog 
          open={openCreateTask} 
          onClose={() => setOpenCreateTask(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    label="Priority"
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newTask.status}
                    label="Status"
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                  >
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="review">Review</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Due Date"
                  value={newTask.dueDate}
                  onChange={(newValue) => setNewTask({ ...newTask, dueDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateTask(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTask} 
              variant="contained" 
              color="primary"
              disabled={!newTask.title}
            >
              Create Task
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TaskManager;
