import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, FlatList, Text, Button, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import UserListItem from '../components/UserListItem';
import { getSocket, closeSocket } from '../services/socket';

export default function HomeScreen({ navigation }) {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const socket = useMemo(() => getSocket(token), [token]);

  const load = async () => {
    try {
      const list = await api('/users', 'GET', undefined, token);
      setUsers(list.sort((a, b) => (new Date(b.lastMessageAt || 0)) - (new Date(a.lastMessageAt || 0))));
    } catch (e) {
      console.warn('Failed to load users', e.message);
    }
  };
  // Use useFocusEffect to load data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );


  useEffect(() => {
    if (!socket) return;

    // Load users on component mount
    load();

    const onPresence = ({ userId, online: isOn }) => setOnline(prev => ({ ...prev, [userId]: isOn }));


    socket.on('presence:update', onPresence);

    return () => {
      socket.off('presence:update', onPresence);
    };
  }, [socket, token]);

  useEffect(() => () => closeSocket(), []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontWeight: '700' }}>Hi, {user.name}</Text>
        <Button title="Logout" onPress={logout} />
      </View>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        renderItem={({ item }) => (
          <UserListItem user={item} online={!!online[item.id]} onPress={() => navigation.navigate('Chat', { peer: item })} />
        )}
      />
    </View>
  );
}