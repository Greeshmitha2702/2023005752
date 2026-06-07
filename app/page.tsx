'use client';

import { useEffect, useMemo, useState, startTransition } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { authenticateForTest, Log, getLoggingConfig } from '../logging_middleware/client';
import type { LogLevel, LogPackage, LogStack, LoggingOptions } from '../logging_middleware/types';

type NotificationType = 'Event' | 'Result' | 'Placement';

type NotificationItem = {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
};

type NotificationApiResponse = {
  notifications: NotificationItem[];
};

type LoadState = {
  loading: boolean;
  error: string;
};

type ViewFilters = {
  limit: number;
  page: number;
  notificationType: 'all' | NotificationType;
};

const baseUrl = process.env.NEXT_PUBLIC_TEST_SERVER_URL || 'http://4.224.186.213';

const typeOrder: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1
};

const typeColors: Record<NotificationType, string> = {
  Placement: '#0f766e',
  Result: '#1d4ed8',
  Event: '#b45309'
};

const initialFilters: ViewFilters = {
  limit: 10,
  page: 1,
  notificationType: 'all'
};

function getPriorityScore(notification: NotificationItem): number {
  const timestampValue = Date.parse(notification.Timestamp) || 0;
  return typeOrder[notification.Type] * 1_000_000_000_000 + timestampValue;
}

function sortNotifications(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort((left, right) => getPriorityScore(right) - getPriorityScore(left));
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

async function fetchNotifications(filters: ViewFilters, accessToken: string) {
  const params = new URLSearchParams();

  params.set('limit', String(filters.limit));
  params.set('page', String(filters.page));

  if (filters.notificationType !== 'all') {
    params.set('notification_type', filters.notificationType);
  }

  const response = await fetch(`${baseUrl}/evaluation-service/notifications?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = (await response.json()) as NotificationApiResponse | { message?: string };

  if (!response.ok) {
    throw new Error(
      typeof data === 'object' && data && 'message' in data && data.message ? data.message : `status ${response.status}`
    );
  }

  return Array.isArray((data as NotificationApiResponse).notifications) ? (data as NotificationApiResponse).notifications : [];
}

export default function Home() {
  const [filters, setFilters] = useState<ViewFilters>(initialFilters);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [state, setState] = useState<LoadState>({ loading: true, error: '' });
  const [summary, setSummary] = useState('Loading notifications...');
  const [accessToken, setAccessToken] = useState('');

  const visibleItems = useMemo(() => {
    const filtered = filters.notificationType === 'all' ? items : items.filter((item) => item.Type === filters.notificationType);
    return sortNotifications(filtered).slice(0, filters.limit);
  }, [filters.limit, filters.notificationType, items]);

  const unreadCount = useMemo(() => visibleItems.filter((item) => !viewedIds.includes(item.ID)).length, [viewedIds, visibleItems]);

  const priorityPreview = useMemo(() => visibleItems.slice(0, Math.min(5, visibleItems.length)), [visibleItems]);

  const updateFilter = (field: keyof ViewFilters) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;

    startTransition(() => {
      setFilters((current) => ({
        ...current,
        [field]: field === 'limit' || field === 'page' ? Number(value) : value
      } as ViewFilters));
    });
  };

  const saveViewed = (notificationID: string) => {
    setViewedIds((current) => (current.includes(notificationID) ? current : [...current, notificationID]));
  };

  const loadNotifications = async (activeFilters: ViewFilters, token: string) => {
    setState({ loading: true, error: '' });
    setSummary('Fetching notifications...');

    try {
      const responseItems = await fetchNotifications(activeFilters, token);

      setItems(responseItems);
      setState({ loading: false, error: '' });
      setSummary(`Loaded ${responseItems.length} notifications.`);

      const loggerConfig = getLoggingConfig({ accessToken: '', clientID: '', clientSecret: '' });
      await Log(
        'frontend',
        'info',
        'page',
        `Loaded ${responseItems.length} notifications for page ${activeFilters.page} with limit ${activeFilters.limit}`,
        getLoggingConfig({ accessToken: '' })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load notifications.';
      setState({ loading: false, error: message });
      setSummary('Failed to load notifications.');

      try {
        await Log('frontend', 'error', 'page', message, getLoggingConfig({ accessToken: '' }));
      } catch {
        // Ignore logging failures so the UI still renders the API error.
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const token = await authenticateForTest({ accessToken: '' });
        if (cancelled) {
          return;
        }
        setAccessToken(token);
        await loadNotifications(filters, token);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unable to authenticate.';
        setState({ loading: false, error: message });
        setSummary('Authentication failed.');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [filters.limit, filters.notificationType, filters.page]);

  const handleRefresh = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      return;
    }

    void loadNotifications(filters, accessToken);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: '1px solid rgba(26, 32, 44, 0.12)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(240,246,255,0.95))',
            boxShadow: '0 24px 60px rgba(18, 58, 99, 0.14)'
          }}
        >
          <Chip
            label="Campus Notifications Microservice"
            sx={{
              alignSelf: 'start',
              bgcolor: 'rgba(33, 94, 158, 0.12)',
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 0.6
            }}
          />
          <Box>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.05, mb: 1 }}>
              Priority Inbox
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 900, fontSize: '1.05rem' }}>
              Real-time notification board built with Next.js, TypeScript, Material UI, and vanilla CSS. The inbox
              sorts by type priority, then by recency, and logs each API fetch through the reusable middleware.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Paper sx={{ p: 2.5, flex: 1, borderRadius: 4, backgroundColor: 'rgba(15, 118, 110, 0.08)' }} elevation={0}>
              <Typography variant="overline" sx={{ color: '#0f766e', fontWeight: 700 }}>
                Visible Notifications
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {visibleItems.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2.5, flex: 1, borderRadius: 4, backgroundColor: 'rgba(29, 78, 216, 0.08)' }} elevation={0}>
              <Typography variant="overline" sx={{ color: '#1d4ed8', fontWeight: 700 }}>
                Unread in View
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {unreadCount}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2.5, flex: 1, borderRadius: 4, backgroundColor: 'rgba(180, 83, 9, 0.08)' }} elevation={0}>
              <Typography variant="overline" sx={{ color: '#b45309', fontWeight: 700 }}>
                Status
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {summary}
              </Typography>
            </Paper>
          </Stack>
        </Box>

        <Paper
          component="form"
          onSubmit={handleRefresh}
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: '1px solid rgba(26, 32, 44, 0.12)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <Stack spacing={2.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Filters
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Notification Type"
                value={filters.notificationType}
                onChange={updateFilter('notificationType')}
                SelectProps={{ native: true }}
              >
                <option value="all">All</option>
                <option value="Event">Event</option>
                <option value="Result">Result</option>
                <option value="Placement">Placement</option>
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Limit"
                value={filters.limit}
                onChange={updateFilter('limit')}
                inputProps={{ min: 1, max: 50 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Page"
                value={filters.page}
                onChange={updateFilter('page')}
                inputProps={{ min: 1, max: 999 }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button type="submit" variant="contained" size="large" disabled={state.loading}>
                Refresh Inbox
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                The app will re-fetch and re-log whenever you change the filters.
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {state.error && <Alert severity="error">{state.error}</Alert>}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          <Paper
            elevation={0}
            sx={{
              flex: 1.1,
              p: { xs: 3, md: 4 },
              borderRadius: 5,
              border: '1px solid rgba(26, 32, 44, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Priority Inbox
              </Typography>
              <Divider />
              {state.loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="rounded" height={72} />
                  <Skeleton variant="rounded" height={72} />
                  <Skeleton variant="rounded" height={72} />
                </Stack>
              ) : visibleItems.length === 0 ? (
                <Alert severity="info">No notifications found for the selected filters.</Alert>
              ) : (
                <Stack spacing={2}>
                  {visibleItems.map((notification) => {
                    const isUnread = !viewedIds.includes(notification.ID);

                    return (
                      <Paper
                        key={notification.ID}
                        elevation={0}
                        onClick={() => saveViewed(notification.ID)}
                        sx={{
                          p: 2.25,
                          borderRadius: 4,
                          cursor: 'pointer',
                          border: `1px solid ${isUnread ? 'rgba(33, 94, 158, 0.22)' : 'rgba(26, 32, 44, 0.12)'}`,
                          backgroundColor: isUnread ? 'rgba(33, 94, 158, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 16px 30px rgba(18, 58, 99, 0.12)'
                          }
                        }}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                          <Chip
                            label={notification.Type}
                            size="small"
                            sx={{
                              backgroundColor: `${typeColors[notification.Type]}14`,
                              color: typeColors[notification.Type],
                              fontWeight: 700
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {notification.Message}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {formatTime(notification.Timestamp)}
                            </Typography>
                          </Box>
                          <Chip
                            label={isUnread ? 'Unread' : 'Viewed'}
                            size="small"
                            variant={isUnread ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              width: { xs: '100%', lg: 360 },
              p: { xs: 3, md: 4 },
              borderRadius: 5,
              border: '1px solid rgba(26, 32, 44, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Priority Preview
              </Typography>
              <Divider />
              {priorityPreview.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No items to preview yet.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {priorityPreview.map((notification, index) => (
                    <Paper
                      key={`${notification.ID}-${index}`}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        backgroundColor: 'rgba(243, 240, 234, 0.6)',
                        border: '1px solid rgba(26, 32, 44, 0.08)'
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Chip
                          size="small"
                          label={notification.Type}
                          sx={{
                            backgroundColor: `${typeColors[notification.Type]}14`,
                            color: typeColors[notification.Type],
                            fontWeight: 700
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          #{index + 1}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 1.25, fontWeight: 600 }}>
                        {notification.Message}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
