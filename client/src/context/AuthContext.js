import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { getSocket, closeSocket } from '../services/socket';

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
        setSocket(getSocket(t));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { token: tk, user: u } = await api('/auth/login', 'POST', { email, password });
    setToken(tk);
    setUser(u);
    setSocket(getSocket(tk));
    await AsyncStorage.setItem('token', tk);
    await AsyncStorage.setItem('user', JSON.stringify(u));
  };

  const register = async (name, email, password) => {
    const { token: tk, user: u } = await api('/auth/register', 'POST', { name, email, password });
    setToken(tk);
    setUser(u);
    setSocket(getSocket(tk));
    await AsyncStorage.setItem('token', tk);
    await AsyncStorage.setItem('user', JSON.stringify(u));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    closeSocket();
    setSocket(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return <AuthCtx.Provider value={{ token, user, login, register, logout, loading, socket }}>{children}</AuthCtx.Provider>;
}