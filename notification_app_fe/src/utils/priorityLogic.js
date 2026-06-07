// JavaScript companion (ESM) for running the Stage 1 demo without TypeScript tooling
export const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

export function parseTimestamp(ts) {
  const v = Date.parse(ts);
  return Number.isNaN(v) ? 0 : v;
}

export function getTopNotificationsSorted(items, n) {
  const scored = items.map((it) => ({ score: TYPE_WEIGHTS[it.Type] * 1_000_000_000_000 + parseTimestamp(it.Timestamp), item: it }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map((s) => s.item);
}

// Simple min-heap for the demo
class MinHeap {
  constructor(compare) {
    this.data = [];
    this.compare = compare;
  }

  size() {
    return this.data.length;
  }

  peek() {
    return this.data[0];
  }

  push(v) {
    this.data.push(v);
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

  bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.compare(this.data[idx], this.data[parent]) < 0) {
        [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
        idx = parent;
      } else break;
    }
  }

  bubbleDown(idx) {
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

export function getTopNotificationsStream(items, n) {
  if (n <= 0) return [];
  const heap = new MinHeap((a, b) => a.score - b.score);
  for (const it of items) {
    const scored = { score: TYPE_WEIGHTS[it.Type] * 1_000_000_000_000 + parseTimestamp(it.Timestamp), item: it };
    if (heap.size() < n) heap.push(scored);
    else if (scored.score > heap.peek().score) {
      heap.pop();
      heap.push(scored);
    }
  }
  const out = [];
  while (heap.size() > 0) out.push(heap.pop());
  return out.reverse().map((s) => s.item);
}

// default export for ESM consumers
export default getTopNotificationsStream;
