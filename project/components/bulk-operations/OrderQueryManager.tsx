import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  TextField, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useSnackbar } from 'notistack';

interface QueryFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: string;
}

export const OrderQueryManager: React.FC = () => {
  const [filters, setFilters] = useState<QueryFilter[]>([
    { field: 'status', operator: 'equals', value: '' }
  ]);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0
  });
  const { enqueueSnackbar } = useSnackbar();

  const updateFilter = (index: number, field: keyof QueryFilter, value: string) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const addFilter = () => {
    setFilters([...filters, { field: 'status', operator: 'equals', value: '' }]);
  };

  const handleOrderQuery = async () => {
    try {
      const response = await fetch('/api/bulk/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filters,
          page: pagination.currentPage,
          pageSize: pagination.pageSize
        })
      });

      const result = await response.json();

      if (response.ok) {
        setQueryResults(result.orders);
        setPagination(result.pagination);
        enqueueSnackbar(`Found ${result.orders.length} orders`, { variant: 'info' });
      } else {
        enqueueSnackbar(result.error || 'Failed to query orders', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  const handleBulkStatusUpdate = async () => {
    const orderIds = queryResults.map(order => order.id);
    
    try {
      const response = await fetch('/api/bulk/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderIds,
          status: 'processing'  // Example status
        })
      });

      const result = await response.json();

      if (response.ok) {
        enqueueSnackbar(`Updated ${result.count} order statuses`, { variant: 'success' });
        handleOrderQuery();  // Refresh results
      } else {
        enqueueSnackbar(result.error || 'Failed to update order statuses', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  return (
    <Card>
      <CardHeader title="Advanced Order Query & Management" />
      <CardContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {filters.map((filter, index) => (
            <Box key={index} display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Field</InputLabel>
                <Select
                  value={filter.field}
                  label="Field"
                  onChange={(e) => updateFilter(index, 'field', e.target.value as string)}
                >
                  {['status', 'total', 'customerId'].map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={filter.operator}
                  label="Operator"
                  onChange={(e) => updateFilter(index, 'operator', e.target.value as string)}
                >
                  {['equals', 'contains', 'gt', 'lt', 'in'].map(op => (
                    <MenuItem key={op} value={op}>{op}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Value"
                value={filter.value}
                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                fullWidth
              />
            </Box>
          ))}
          
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              onClick={addFilter}
            >
              Add Filter
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOrderQuery}
            >
              Query Orders
            </Button>
          </Box>

          {queryResults.length > 0 && (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Customer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryResults.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>{order.customer.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>
                  Page {pagination.currentPage} of {pagination.totalPages} 
                  (Total {pagination.totalCount} orders)
                </Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    onClick={handleBulkStatusUpdate}
                  >
                    Bulk Update Status
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
