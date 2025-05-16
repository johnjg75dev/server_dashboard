import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Button, Typography } from '@mui/material'; // Added Button, Typography
import customTheme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Layout from './components/Layout';
import PageHeader from './components/PageHeader'; // Moved up

// Page Imports
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import ApachePage from './pages/ApachePage'; // Now these files exist
import MySQLPage from './pages/MySQLPage';
import PHPPage from './pages/PHPPage';
import SystemPage from './pages/SystemPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
//import VirtualMachinesPage from './pages/VirtualMachinesPage';
// Icons (if used directly in App.tsx, otherwise they are in their respective page files)
// import WebIcon from '@mui/icons-material/Http';
// import StorageIcon from '@mui/icons-material/Storage';
// ... other icons if needed by a factory here, but prefer them in page files

// ProtectedRoute should be defined before App component
const ProtectedRoute: React.FC = () => {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // IMPORTANT FIX for TS2559: Layout contains its own Outlet for child routes.
  // ProtectedRoute's job is to wrap Layout, not to pass an Outlet into Layout.
  return <Layout />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}> {/* Protected routes use Layout */}
              <Route path="/" element={<OverviewPage />} />
              <Route path="/overview" element={<Navigate to="/" replace />} /> {/* Alias */}
              <Route path="/apache" element={<ApachePage />} />
              <Route path="/mysql" element={<MySQLPage />} />
              <Route path="/php" element={<PHPPage />} />
              <Route path="/system" element={<SystemPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} /> {/* Fallback */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;