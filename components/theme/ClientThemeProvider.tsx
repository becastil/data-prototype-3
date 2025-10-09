'use client';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ReactNode, useMemo } from 'react';

export function ClientThemeProvider({ children }: ClientThemeProviderProps) {
  // Create minimalist theme on client side to avoid serialization issues
  const healthcareTheme = useMemo(() => createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue accent for buttons only
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#666666', // Medium gray
      light: '#999999',
      dark: '#333333',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    error: {
      main: '#1a1a1a',
    },
    warning: {
      main: '#1a1a1a',
    },
    info: {
      main: '#1a1a1a',
    },
    success: {
      main: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.8,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 4,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderRadius: '4px',
          border: '1px solid #e8e8e8',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 400,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#1976d2',
          color: '#1976d2',
          backgroundColor: '#ffffff',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: '#1976d2',
            color: '#ffffff',
          },
        },
      },
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          display: 'none', // Hide chips by default for minimalist design
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          color: '#333333',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f5f5f5',
            color: '#1a1a1a',
            fontWeight: 600,
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
  }), []);

  return (
    <ThemeProvider theme={healthcareTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

interface ClientThemeProviderProps {
  children: ReactNode;
}
