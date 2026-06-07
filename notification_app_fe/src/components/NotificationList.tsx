import React from 'react';
import NotificationCard from './NotificationCard';

export default function NotificationList({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <div>No notifications.</div>;

  return (
    <div>
      {items.map((it) => (
        <NotificationCard key={it.ID || Math.random()} item={it} />
      ))}
    </div>
  );
}
