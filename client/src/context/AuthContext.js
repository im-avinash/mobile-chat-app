import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { token: tk, user: u } = await api('/auth/login', 'POST', { email, password });
    setToken(tk); setUser(u);
    await AsyncStorage.setItem('token', tk);
    await AsyncStorage.setItem('user', JSON.stringify(u));
  };

  const register = async (name, email, password) => {
    const { token: tk, user: u } = await api('/auth/register', 'POST', { name, email, password });
    setToken(tk); setUser(u);
    await AsyncStorage.setItem('token', tk);
    await AsyncStorage.setItem('user', JSON.stringify(u));
  };

  const logout = async () => {
    setToken(null); setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return <AuthCtx.Provider value={{ token, user, login, register, logout, loading }}>{children}</AuthCtx.Provider>;
}