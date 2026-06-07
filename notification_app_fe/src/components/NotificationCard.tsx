import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';

export default function NotificationCard({ item }: { item: { ID?: string; Type: string; Message?: string; Timestamp: string } }) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Chip label={item.Type} size="small" sx={{ mb: 1 }} />
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {item.Message}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {new Date(item.Timestamp).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
