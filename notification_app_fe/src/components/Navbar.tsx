import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';

export default function Navbar({ view, onChange }: { view: 'all' | 'priority'; onChange: (v: 'all' | 'priority') => void }) {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Campus Notifications
        </Typography>
        <Button variant={view === 'all' ? 'contained' : 'text'} onClick={() => onChange('all')} sx={{ mr: 1 }}>
          All
        </Button>
        <Button variant={view === 'priority' ? 'contained' : 'text'} onClick={() => onChange('priority')}>
          Priority
        </Button>
      </Toolbar>
    </AppBar>
  );
}
