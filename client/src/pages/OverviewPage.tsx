import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, Box, Button, CircularProgress } from '@mui/material'; // Added CircularProgress
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import DnsIcon from '@mui/icons-material/Dns'; // For Server Status

// STUB DATA
const mockSystemInfo = {
  os: 'Ubuntu 22.04 LTS',
  uptime: '15d 4h 32m',
  cpuUsage: 25, // percentage
  ramUsage: 60, // percentage
  ramTotal: '16 GB',
  diskUsage: 45, // percentage
  diskTotal: '500 GB',
};

interface Service {
    name: string;
    status: string;
    color: string;
}
interface ServiceStatus {
    [key: string]: Service;
}

const mockServiceStatus: ServiceStatus = {
    apache: { name: "Apache", status: "Running", color: "success.main" },
    mysql: { name: "MySQL", status: "Running", color: "success.main" },
    php: { name: "PHP-FPM", status: "Stopped", color: "error.main" },
};

const OverviewPage: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState(mockSystemInfo);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>(mockServiceStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('OverviewPage: Fetching system info and service statuses...');
    const timer = setTimeout(() => {
      setSystemInfo(prev => ({...prev, cpuUsage: Math.floor(Math.random() * 100)}));
      setServiceStatus(prev => ({
        ...prev,
        php: Math.random() > 0.5
            ? { name: "PHP-FPM", status: "Running", color: "success.main" }
            : { name: "PHP-FPM", status: "Stopped", color: "error.main" }
      }));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleServiceAction = (serviceName: string, action: string) => {
    console.log(`Action: ${action} on ${serviceName}`);
    alert(`STUB: ${action} ${serviceName}`);
  };


  return (
    <>
      <PageHeader title="System Overview" icon={<DashboardIcon />} subtitle="Real-time server health and service status" />

      <Grid container spacing={3}>
        {/* System Metrics */}
       <Grid component="div" size={{xs:12, md:6, lg:3}}> {/* Added component="div" */}
          <StatCard title="CPU Usage" value={systemInfo.cpuUsage} unit="%" icon={<SpeedIcon />} loading={loading} color="primary.main" />
        </Grid>
        <Grid component="div" size={{xs:12, md:6, lg:3}}> {/* Added component="div" */}
          <StatCard title="RAM Usage" value={systemInfo.ramUsage} unit={`% of ${systemInfo.ramTotal}`} icon={<MemoryIcon />} loading={loading} color="secondary.main" />
        </Grid>
        <Grid component="div" size={{xs:12, md:6, lg:3}}> {/* Added component="div" */}
          <StatCard title="Disk Usage" value={systemInfo.diskUsage} unit={`% of ${systemInfo.diskTotal}`} icon={<StorageIcon />} loading={loading} color="info.main" />
        </Grid>
        <Grid component="div" size={{xs:12, md:6, lg:3}}> {/* Added component="div" */}
          <StatCard title="System Uptime" value={systemInfo.uptime} icon={<DashboardIcon />} loading={loading} color="warning.main" />
        </Grid>

        {/* Service Status Section */}
        <Grid component="div" size={{xs:12}}> {/* Added component="div" */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
              Service Status
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(serviceStatus).map(([key, service]) => (
                <Grid component="div" size={{xs:12, sm:6, md:4}} key={key}> {/* Added component="div" */}
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: service.color }}>
                     <DnsIcon sx={{ fontSize: 40, color: service.color, mb: 1 }} />
                    <Typography variant="h6">{service.name}</Typography>
                    <Typography variant="body1" sx={{ color: service.color, fontWeight: 'bold' }}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : service.status}
                    </Typography>
                    {!loading && (
                      <Box mt={1}>
                        {service.status === "Running" ? (
                          <>
                            <Button size="small" variant="outlined" color="warning" onClick={() => handleServiceAction(service.name, 'Restart')} sx={{ mr: 1 }}>Restart</Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => handleServiceAction(service.name, 'Stop')}>Stop</Button>
                          </>
                        ) : (
                          <Button size="small" variant="outlined" color="success" onClick={() => handleServiceAction(service.name, 'Start')}>Start</Button>
                        )}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

         {/* Quick Info Section */}
        <Grid component="div" size={{xs:12}}>  {/* Added component="div" */}
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>Quick Info</Typography>
                <Typography><strong>Operating System:</strong> {loading ? <CircularProgress size={16} color="inherit" /> : systemInfo.os}</Typography>
                {/* Add more quick info here */}
            </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default OverviewPage;