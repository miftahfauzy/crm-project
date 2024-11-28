import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from 'notistack';

export const OrderReportGenerator: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      enqueueSnackbar('Please select both start and end dates', { variant: 'warning' });
      return;
    }

    try {
      const response = await fetch(
        `/api/bulk/orders?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, 
        { method: 'GET' }
      );

      const result = await response.json();

      if (response.ok) {
        setReportData(result);
        enqueueSnackbar('Report generated successfully', { variant: 'success' });
      } else {
        enqueueSnackbar(result.error || 'Failed to generate report', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  const calculateTotalRevenue = () => {
    return reportData.reduce((total, report) => total + (report._sum.total || 0), 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardHeader title="Order Report Generator" />
        <CardContent>
          <Box display="flex" gap={2} marginBottom={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGenerateReport}
              sx={{ height: '56px' }}
            >
              Generate Report
            </Button>
          </Box>

          {reportData.length > 0 && (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Order Count</TableCell>
                      <TableCell>Total Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell>{report.status}</TableCell>
                        <TableCell>{report._count.id}</TableCell>
                        <TableCell>${(report._sum.total || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box marginTop={2}>
                <Typography variant="h6">
                  Total Revenue: ${calculateTotalRevenue().toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};
