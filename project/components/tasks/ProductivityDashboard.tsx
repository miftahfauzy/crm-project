import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProductivityReport {
  teamMember: {
    id: string;
    name: string;
  };
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageTaskCompletionTime: number;
  taskCompletionRate: number;
}

interface ProductivityDashboardProps {
  userRole: string;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({ userRole }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ProductivityReport[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1), // First day of current year
    endDate: new Date() // Today
  });

  const fetchProductivityReport = async () => {
    // Only allow managers and admins to view team productivity
    if (!['admin', 'manager'].includes(userRole)) {
      console.error('Unauthorized access to productivity dashboard');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/tasks/productivity?` + 
        `startDate=${dateRange.startDate.toISOString()}` + 
        `&endDate=${dateRange.endDate.toISOString()}`
      );
      const result = await response.json();

      if (result.success) {
        setReport(result.data.teamProductivity);
      } else {
        console.error('Failed to fetch productivity report');
      }
    } catch (error) {
      console.error('Error fetching productivity report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductivityReport();
  }, [userRole, dateRange]);

  if (!['admin', 'manager'].includes(userRole)) {
    return (
      <Typography variant="h6" color="error">
        Unauthorized: Only managers can view this dashboard
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Team Productivity Dashboard</Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue || new Date() }))}
              renderInput={(params) => <FormControl fullWidth>{params.inputProps}</FormControl>}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue || new Date() }))}
              renderInput={(params) => <FormControl fullWidth>{params.inputProps}</FormControl>}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, height: '500px' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Task Completion by Team Member</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={report}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="teamMember.name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completedTasks" name="Completed Tasks" fill="#82ca9d" />
                  <Bar dataKey="inProgressTasks" name="In Progress Tasks" fill="#8884d8" />
                  <Bar dataKey="overdueTasks" name="Overdue Tasks" fill="#ff7f0e" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '500px' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Team Performance Metrics</Typography>
              {report.map((member) => (
                <Box key={member.teamMember.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{member.teamMember.name}</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Completion Rate:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="primary">
                        {(member.taskCompletionRate * 100).toFixed(2)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Avg. Task Time:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="secondary">
                        {member.averageTaskCompletionTime.toFixed(2)} days
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ProductivityDashboard;
