import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Grid 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CustomerSegment {
  type: string;
  status: string;
  _count: { id: number };
  _sum: { orders: { total: number } };
}

interface TopCustomer {
  id: string;
  name: string;
  _sum: { orders: { total: number } };
}

interface CustomerAnalyticsData {
  segmentBreakdown: CustomerSegment[];
  topCustomers: TopCustomer[];
}

export const CustomerAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<CustomerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerAnalytics = async () => {
      try {
        const response = await fetch('/api/customers/analytics');
        const result = await response.json();

        if (result.success) {
          setAnalyticsData(result.data);
        } else {
          console.error('Failed to fetch customer analytics');
        }
      } catch (error) {
        console.error('Error fetching customer analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerAnalytics();
  }, []);

  const prepareSegmentChartData = () => {
    if (!analyticsData) return [];

    const chartData = analyticsData.segmentBreakdown.map(segment => ({
      name: `${segment.type} - ${segment.status}`,
      customers: segment._count.id,
      totalRevenue: segment._sum.orders?.total || 0
    }));

    return chartData;
  };

  if (loading) {
    return <Typography>Loading customer analytics...</Typography>;
  }

  if (!analyticsData) {
    return <Typography color="error">Failed to load customer analytics</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customer Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Customer Segments</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareSegmentChartData()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" fill="#8884d8" name="Number of Customers" />
                <Bar dataKey="totalRevenue" fill="#82ca9d" name="Total Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Top Customers</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`$${customer._sum.orders?.total.toFixed(2) || 0}`} 
                          color="primary" 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerAnalytics;
