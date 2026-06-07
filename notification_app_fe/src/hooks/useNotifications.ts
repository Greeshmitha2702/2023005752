import { useEffect, useState, useCallback } from 'react';
import type { NotificationItem } from '../utils/priorityLogic';
import { fetchNotifications } from '../api/notificationApi';

export default function useNotifications(initial = { limit: 10, page: 1, notificationType: 'all' as const }) {
  const [filters, setFilters] = useState(initial);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchNotifications({ limit: filters.limit, page: filters.page, notification_type: filters.notificationType === 'all' ? undefined : filters.notificationType });
      setItems(list as NotificationItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filters.limit, filters.page, filters.notificationType]);

  useEffect(() => {
    void load();
  }, [load]);

  return { filters, setFilters, items, loading, error, reload: load };
}
