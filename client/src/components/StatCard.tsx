import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, SxProps, Theme } from '@mui/material'; // Make sure Theme is imported

interface StatCardProps {
  title: string;
  value: string | number;
  // Ensure icon can accept sx
  icon?: React.ReactElement<{ sx?: SxProps<Theme> }>;
  unit?: string;
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | string;
  sx?: SxProps<Theme>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, unit, loading, color = 'primary.main', sx }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="div" sx={{ color: 'text.secondary', mb: 1 }}>
            {title}
          </Typography>
          {icon && React.cloneElement(icon, { // sx prop will now be recognized
             sx: {
                fontSize: 30,
                color: color, // Apply the card's dynamic color
                ...icon.props.sx // Preserve existing sx from icon if any
             }
          })}
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '50px' }}>
            <CircularProgress size={24} sx={{color: color}} />
          </Box>
        ) : (
          <Typography variant="h3" component="div" sx={{ color: color, mt: 1, mb: 0.5, fontWeight: 'bold' }}>
            {value}
            {unit && <Typography variant="h5" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>{unit}</Typography>}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;