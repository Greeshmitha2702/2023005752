import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './components/Navbar';
import AllNotifications from './pages/AllNotifications';
import PriorityNotifications from './pages/PriorityNotifications';

export default function App() {
  const [view, setView] = useState<'all' | 'priority'>('all');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Navbar view={view} onChange={(v) => setView(v)} />
      <Box sx={{ mt: 4 }}>{view === 'all' ? <AllNotifications /> : <PriorityNotifications />}</Box>
    </Container>
  );
}
