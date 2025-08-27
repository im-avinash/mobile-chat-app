import { Platform } from 'react-native';

export const API_BASE = Platform.select({
  ios: 'http://localhost:4000',
  android: 'http://10.0.2.2:4000',
  default: 'http://localhost:4000'
});

export async function api(path, method = 'GET', body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error((await res.json()).error || 'API error');
  return res.json();
}