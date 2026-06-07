import React from 'react';
import { Stack, Paper, Typography, Button } from '@mui/material';
import useNotifications from '../hooks/useNotifications';
import NotificationList from '../components/NotificationList';

export default function AllNotifications() {
  const { items, loading, error, reload, filters, setFilters } = useNotifications({ limit: 10, page: 1, notificationType: 'all' });

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">All Notifications</Typography>
        <Button onClick={() => setFilters((f: any) => ({ ...f, page: f.page + 1 }))} sx={{ mt: 1 }}>
          Next Page
        </Button>
      </Paper>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <NotificationList items={items} />
      <Button onClick={() => void reload()}>Refresh</Button>
    </Stack>
  );
}
