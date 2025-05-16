import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WebIcon from '@mui/icons-material/Http'; // Apache
import StorageIcon from '@mui/icons-material/Storage'; // MySQL
import CodeIcon from '@mui/icons-material/Php'; // PHP
import MemoryIcon from '@mui/icons-material/Memory'; // System
import ArticleIcon from '@mui/icons-material/Article'; // Logs
import SettingsIcon from '@mui/icons-material/Settings';
// import YourLogo from '../assets/logo.png'; // Example logo

const drawerWidth = 260;

interface SidebarItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/' },
  { text: 'Apache', icon: <WebIcon />, path: '/apache' },
  { text: 'MySQL', icon: <StorageIcon />, path: '/mysql' },
  { text: 'PHP', icon: <CodeIcon />, path: '/php' },
  { text: 'System', icon: <MemoryIcon />, path: '/system' },
  { text: 'Logs', icon: <ArticleIcon />, path: '/logs' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar: React.FC<{ mobileOpen: boolean; handleDrawerToggle: () => void }> = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2, flexDirection: 'column' }}>
        {/* <img src={YourLogo} alt="Logo" style={{ height: 40, marginRight: 10 }} /> */}
        <Typography variant="h5" noWrap component="div" sx={{ color: 'primary.main', letterSpacing: '1px' }}>
          SERVER CTRL
        </Typography>
         <Typography variant="caption" sx={{ color: 'secondary.main', letterSpacing: '0.5px' }}>
          v0.1 ALPHA
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.2)' }} />
      <List>
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/overview'))} // Handle overview alias
              sx={{
                '&.Mui-selected .MuiListItemIcon-root': {
                    color: 'secondary.main', // Highlight icon color on select
                },
                '&.Mui-selected .MuiListItemText-primary': {
                    fontWeight: 'bold',
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;