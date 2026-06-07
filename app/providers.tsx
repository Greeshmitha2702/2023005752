'use client';

import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#215e9e'
    },
    background: {
      default: '#f3f0ea'
    }
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif'
  }
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}