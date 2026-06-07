import React from 'react';
import { Paper, Typography } from '@mui/material';
import useNotifications from '../hooks/useNotifications';
import NotificationList from '../components/NotificationList';
import getTopNotifications from '../utils/priorityLogic';

export default function PriorityNotifications() {
  const { items, loading, error } = useNotifications({ limit: 50, page: 1, notificationType: 'all' });

  const top = getTopNotifications(items || [], 10);

  return (
    <div>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Priority Notifications (Top 10)</Typography>
      </Paper>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <NotificationList items={top} />
    </div>
  );
}
