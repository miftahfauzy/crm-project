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
  Paper 
} from '@mui/material';
import { useSnackbar } from 'notistack';

interface TagInput {
  name: string;
  customerId?: string;
}

export const BulkTagManager: React.FC = () => {
  const [tags, setTags] = useState<TagInput[]>([{ name: '', customerId: '' }]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleAddTag = () => {
    setTags([...tags, { name: '', customerId: '' }]);
  };

  const updateTag = (index: number, field: keyof TagInput, value: string) => {
    const newTags = [...tags];
    newTags[index][field] = value;
    setTags(newTags);
  };

  const handleBulkTagCreation = async () => {
    try {
      const response = await fetch('/api/bulk/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tags: tags.filter(tag => tag.name.trim() !== '') 
        })
      });

      const result = await response.json();

      if (response.ok) {
        enqueueSnackbar('Tags created successfully', { variant: 'success' });
        setTags([{ name: '', customerId: '' }]);
      } else {
        enqueueSnackbar(result.error || 'Failed to create tags', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  const handleTagSearch = async () => {
    try {
      const tagName = tags[0].name;  // Use first tag name for search
      const response = await fetch(`/api/bulk/tags?tagName=${tagName}&entityType=orders`, {
        method: 'GET',
      });

      const result = await response.json();

      if (response.ok) {
        setSearchResults(result);
        enqueueSnackbar(`Found ${result.length} orders with tag ${tagName}`, { variant: 'info' });
      } else {
        enqueueSnackbar(result.error || 'Failed to search tags', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  return (
    <Card>
      <CardHeader title="Bulk Tag Management" />
      <CardContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {tags.map((tag, index) => (
            <Box key={index} display="flex" gap={2}>
              <TextField
                label="Tag Name"
                value={tag.name}
                onChange={(e) => updateTag(index, 'name', e.target.value)}
                fullWidth
              />
              <TextField
                label="Customer ID (Optional)"
                value={tag.customerId || ''}
                onChange={(e) => updateTag(index, 'customerId', e.target.value)}
                fullWidth
              />
            </Box>
          ))}
          
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              onClick={handleAddTag}
            >
              Add Another Tag
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBulkTagCreation}
            >
              Create Tags
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleTagSearch}
            >
              Search Orders by Tag
            </Button>
          </Box>

          {searchResults.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
