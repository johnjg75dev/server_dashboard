import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { SxProps, Theme } from '@mui/system';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  // Ensure icon can accept sx, a common pattern for MUI icons
  icon?: React.ReactElement<{ sx?: SxProps<Theme> }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <Box mb={4}>
      <Box display="flex" alignItems="center" mb={1}>
        {icon && React.cloneElement(icon, { // sx prop will now be recognized due to updated type
            sx: {
                fontSize: '2.5rem',
                mr: 2,
                color: 'primary.main',
                ...icon.props.sx // Preserve existing sx from icon if any
            }
        })}
        <Typography variant="h2" component="h1">
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="h5" color="text.secondary" sx={{ ml: icon ? 'calc(2.5rem + 16px)' : 0 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;