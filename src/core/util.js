// 通用小工具

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function pct(value) {
  return `${Math.round(value * 100)}%`;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function sum(list, fn = (x) => x) {
  return list.reduce((acc, item) => acc + fn(item), 0);
}

export function unique(list) {
  return [...new Set(list)];
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 把 [{weight}] 的数组按 id 去重合并（用于多区域共享事件池） */
export function mergePools(...pools) {
  const map = new Map();
  for (const pool of pools) {
    for (const entry of pool) {
      const id = typeof entry === 'string' ? entry : entry.id;
      if (!id) continue;
      const prev = map.get(id);
      if (!prev) map.set(id, { ...(typeof entry === 'string' ? { id, weight: 1 } : entry) });
      else prev.weight = Math.max(prev.weight ?? 1, entry.weight ?? 1);
    }
  }
  return [...map.values()];
}
