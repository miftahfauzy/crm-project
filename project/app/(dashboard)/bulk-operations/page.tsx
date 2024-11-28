'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper 
} from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Import the components we created
import { BulkTagManager } from '@/components/bulk-operations/BulkTagManager';
import { OrderQueryManager } from '@/components/bulk-operations/OrderQueryManager';
import { OrderReportGenerator } from '@/components/bulk-operations/OrderReportGenerator';

export default function BulkOperationsDashboard() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Container maxWidth="xl">
        <Box my={4}>
          <Typography variant="h4" gutterBottom>
            Bulk Operations Dashboard
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Tag Management
                </Typography>
                <BulkTagManager />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Order Reporting
                </Typography>
                <OrderReportGenerator />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Advanced Order Query
                </Typography>
                <OrderQueryManager />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </SnackbarProvider>
  );
}
