import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';

function Root() {
  return (
    <>
      <CssBaseline />
      <App />
    </>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');
createRoot(container).render(<Root />);
