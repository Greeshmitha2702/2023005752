export type NotificationType = 'Placement' | 'Result' | 'Event';

export type NotificationItem = {
  ID?: string;
  Type: NotificationType;
  Message?: string;
  Timestamp: string; // ISO or parseable timestamp
};

const TYPE_WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function parseTimestamp(ts: string): number {
  const v = Date.parse(ts);
  return Number.isNaN(v) ? 0 : v;
}

// Simple sorting approach (O(n log n)): clear and correct for most test sizes.
export function getTopNotificationsSorted(items: NotificationItem[], n: number): NotificationItem[] {
  const scored = items.map((it) => ({
    score: TYPE_WEIGHTS[it.Type] * 1_000_000_000_000 + parseTimestamp(it.Timestamp),
    item: it
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, n).map((s) => s.item);
}

// Min-heap implementation to maintain top-N in streaming mode. O(n log k) time, O(k) memory.
class MinHeap<T> {
  private data: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.compare = compare;
  }

  size() {
    return this.data.length;
  }

  peek() {
    return this.data[0];
  }

  push(value: T) {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }

  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.compare(this.data[idx], this.data[parent]) < 0) {
        [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
        idx = parent;
      } else break;
    }
  }

  private bubbleDown(idx: number) {
    const len = this.data.length;
    while (true) {
      let left = idx * 2 + 1;
      let right = idx * 2 + 2;
      let smallest = idx;

      if (left < len && this.compare(this.data[left], this.data[smallest]) < 0) smallest = left;
      if (right < len && this.compare(this.data[right], this.data[smallest]) < 0) smallest = right;

      if (smallest !== idx) {
        [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
        idx = smallest;
      } else break;
    }
  }
}

type Scored = { score: number; item: NotificationItem };

export function getTopNotificationsStream(items: NotificationItem[], n: number): NotificationItem[] {
  if (n <= 0) return [];
  const heap = new MinHeap<Scored>((a, b) => a.score - b.score);

  for (const it of items) {
    const scored: Scored = { score: TYPE_WEIGHTS[it.Type] * 1_000_000_000_000 + parseTimestamp(it.Timestamp), item: it };
    if (heap.size() < n) {
      heap.push(scored);
    } else if (scored.score > heap.peek().score) {
      heap.pop();
      heap.push(scored);
    }
  }

  const out: Scored[] = [];
  while (heap.size() > 0) out.push(heap.pop());

  // popped from smallest → largest, so reverse to get highest-first
  return out.reverse().map((s) => s.item);
}

// Default exported convenience function
export default function getTopNotifications(items: NotificationItem[], n = 10): NotificationItem[] {
  // use stream algorithm for better large-list performance
  return getTopNotificationsStream(items, n);
}
