import { createTheme } from '@mui/material/styles';

export const colors = {
  primary: '#003366', // Deep blue for headers
  secondary: '#FFD700', // Golden yellow for CTAs
  success: '#228B22', // Green for health indicators
  background: '#FFFFFF', // White backgrounds
  phulkari: '#B8860B', // Golden brown for Phulkari accents
  gradient: {
    primary: 'linear-gradient(135deg, #003366 0%, #228B22 100%)',
    hero: 'linear-gradient(135deg, #003366 0%, #ffffff 100%)',
  }
};

export const punjabTheme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.primary,
    },
    success: {
      main: colors.success,
    },
    background: {
      default: colors.background,
      paper: colors.background,
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      color: colors.primary,
    },
    h2: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      color: colors.primary,
    },
    h3: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
      color: colors.primary,
    },
    h4: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      color: colors.primary,
    },
    body1: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
        contained: {
          background: colors.secondary,
          color: colors.primary,
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
          '&:hover': {
            background: '#E6C200',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(255, 215, 0, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 51, 102, 0.1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(0, 51, 102, 0.15)',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  },
  spacing: 8, // 8px spacing system
});