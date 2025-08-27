// mobile/src/utils/time.js

// Format a JS Date or ISO string into a short, human-readable time
export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format into date + time (useful for debugging or message details)
export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
