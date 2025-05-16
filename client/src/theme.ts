import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Example: Using a futuristic font (add to public/index.html if not self-hosting)
// <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

let customTheme = createTheme({
  palette: {
    mode: 'dark', // Enforce dark mode
    primary: {
      main: '#00ffff', // Cyan/Teal
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff00ff', // Magenta
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0f1f', // Very dark desaturated blue
      paper: '#101832',   // Slightly lighter for cards/surfaces
    },
    text: {
      primary: '#e0e0e0', // Light grey for primary text
      secondary: '#b0b0b0', // Medium grey for secondary text
    },
    error: {
      main: '#ff4d4d',
    },
    warning: {
      main: '#ffcc00',
    },
    info: {
      main: '#00bcd4',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.8rem' },
    h2: { fontWeight: 700, fontSize: '2.2rem', color: '#00ffff' },
    h3: { fontWeight: 700, fontSize: '1.8rem' },
    h4: { fontWeight: 500, fontSize: '1.5rem', color: '#ff00ff' },
    h5: { fontWeight: 500, fontSize: '1.2rem' },
    h6: { fontWeight: 500, fontSize: '1rem' },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#080c18', // Even darker app bar
          boxShadow: '0px 4px 20px rgba(0, 255, 255, 0.3)', // Cyan glow
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#080c18',
          borderRight: '1px solid rgba(0, 255, 255, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0, 255, 255, 0.2)',
          boxShadow: '0px 2px 10px rgba(0, 255, 255, 0.1)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 5px 20px rgba(0, 255, 255, 0.3)',
          }
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        containedPrimary: {
          boxShadow: '0px 2px 8px rgba(0, 255, 255, 0.4)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 255, 255, 0.6)',
          }
        },
        containedSecondary: {
          boxShadow: '0px 2px 8px rgba(255, 0, 255, 0.4)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(255, 0, 255, 0.6)',
          }
        }
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 255, 255, 0.15)', // Selected item highlight
            borderLeft: '4px solid #00ffff',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 255, 0.25)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#00ffff', // Icon color
        }
      }
    }
  },
});

customTheme = responsiveFontSizes(customTheme);

export default customTheme;