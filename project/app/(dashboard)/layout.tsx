'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  CssBaseline
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Tag as TagIcon, 
  ShoppingCart as OrderIcon, 
  QueryStats as ReportIcon 
} from '@mui/icons-material';
import Link from 'next/link';

const drawerWidth = 240;

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard' 
    },
    { 
      text: 'Bulk Operations', 
      icon: <ReportIcon />, 
      path: '/bulk-operations' 
    },
    { 
      text: 'Orders', 
      icon: <OrderIcon />, 
      path: '/orders' 
    },
    { 
      text: 'Tags', 
      icon: <TagIcon />, 
      path: '/tags' 
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#2196f3'
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            CRM Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box' 
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <Link 
                key={item.text} 
                href={item.path} 
                passHref
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ListItem button component="a">
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </Link>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: '#f4f6f8',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
