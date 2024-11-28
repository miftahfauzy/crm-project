import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface CommunicationStat {
  type: string;
  direction: string;
  status: string;
  _count: { id: number };
  _avg: { duration: number };
}

interface TopCommunicator {
  userId: string;
  _count: { id: number };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CommunicationAnalyticsData {
  stats: CommunicationStat[];
  topCommunicators: TopCommunicator[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const CommunicationAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<CommunicationAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCommunicator, setSelectedCommunicator] = useState<TopCommunicator | null>(null);

  const fetchCommunicationAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/communications/analytics?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        console.error('Failed to fetch communication analytics');
      }
    } catch (error) {
      console.error('Error fetching communication analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunicationAnalytics();
  }, []);

  const prepareCommunicationTypeData = () => {
    if (!analyticsData) return [];

    const typeData = analyticsData.stats.reduce((acc, stat) => {
      const key = stat.type;
      if (!acc[key]) {
        acc[key] = { 
          name: key, 
          communications: 0,
          avgDuration: 0
        };
      }
      acc[key].communications += stat._count.id;
      acc[key].avgDuration = stat._avg.duration || 0;
      return acc;
    }, {} as Record<string, { name: string; communications: number; avgDuration: number }>);

    return Object.values(typeData);
  };

  const handleCommunicatorDetails = (communicator: TopCommunicator) => {
    setSelectedCommunicator(communicator);
  };

  const handleCloseCommunicatorDialog = () => {
    setSelectedCommunicator(null);
  };

  if (loading) {
    return <Typography>Loading communication analytics...</Typography>;
  }

  if (!analyticsData) {
    return <Typography color="error">Failed to load communication analytics</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Communication Analytics Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchCommunicationAnalytics}
            >
              Refresh Analytics
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">Communication Types</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareCommunicationTypeData()}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="communications" fill="#8884d8" name="Communications" />
                  <Bar dataKey="avgDuration" fill="#82ca9d" name="Avg Duration" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">Top Communicators</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Communications</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.topCommunicators.map((communicator) => (
                      <TableRow key={communicator.userId}>
                        <TableCell>{communicator.user?.name || 'Unknown'}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={communicator._count.id} 
                            color="primary" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            size="small" 
                            onClick={() => handleCommunicatorDetails(communicator)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        <Dialog 
          open={!!selectedCommunicator} 
          onClose={handleCloseCommunicatorDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Communicator Details</DialogTitle>
          <DialogContent>
            {selectedCommunicator && (
              <Box>
                <Typography>Name: {selectedCommunicator.user?.name}</Typography>
                <Typography>Email: {selectedCommunicator.user?.email}</Typography>
                <Typography>Total Communications: {selectedCommunicator._count.id}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCommunicatorDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CommunicationAnalytics;
