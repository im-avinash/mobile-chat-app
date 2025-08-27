// mobile/src/screens/ChatScreen.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, TextInput, Button, KeyboardAvoidingView, Platform, Text, StyleSheet } from 'react-native';
import { api } from '../api/client'; // your fetch wrapper: api(path, method, body, token)
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket'; // returns socket instance (creates if necessary)
import MessageBubble from '../components/MessageBubble';

export default function ChatScreen({ route }) {
  const { peer } = route.params; // peer = { id, name, ... }
  const { token, user, socket } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [peerTyping, setPeerTyping] = useState(false);
  const listRef = useRef(null);

  // load conversation messages once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const msgs = await api(`/users/with/${peer.id}/messages`, 'GET', undefined, token);
        if (!mounted) return;
        // normalize field names so items have id and createdAt
        const norm = msgs.map(m => ({
          id: m.id || m._id,
          from: m.from,
          to: m.to,
          text: m.text,
          createdAt: m.createdAt || m.created_at || m.created,
          deliveredAt: m.deliveredAt,
          readAt: m.readAt
        }));
        setMessages(norm);
        // mark unread as read (emit read receipts for messages that were to me and not read)
        const unreadIds = norm.filter(m => String(m.to) === String(user.id) && !m.readAt).map(m => m.id);
        if (unreadIds.length) {
          socket.emit('message:read', { messageIds: unreadIds, peerId: peer.id });
        }
      } catch (e) {
        console.warn('Load messages failed', e.message || e);
      }
    })();
    return () => { mounted = false; };
  }, [peer.id, token]);

  // socket event handlers
  useEffect(() => {
    if (!socket) return;
    const onNew = (msg) => {
      // msg might come as plain DB object or our payload; normalize
      const m = {
        id: msg.id || msg._id,
        from: msg.from,
        to: msg.to,
        text: msg.text,
        createdAt: msg.createdAt,
        deliveredAt: msg.deliveredAt,
        readAt: msg.readAt
      };

      // only include messages that belong to this conversation
      if (String(m.from) === String(peer.id) || String(m.to) === String(peer.id)) {
        if (msg.clientId && String(m.from) === String(user.id)) {
          // Correctly find and replace the optimistic message
          setMessages(prev => prev.map(oldMsg => oldMsg.id === msg.clientId ? m : oldMsg));
        } else {
          // Add the new message if it's not an optimistic update
          setMessages(prev => [...prev, m]);
        }

        // if it's a message for me, immediately mark it read
        if (String(m.to) === String(user.id)) {
          socket.emit('message:read', { messageIds: [m.id], peerId: peer.id });
        }
      }
    };

    const onRead = ({ messageIds, peerId }) => {
      // peerId in our server ack is the user who read them (or the peer) — normalize by checking membership
      // only update UI when the ack concerns this peer conversation
      if (String(peerId) !== String(peer.id) && String(peerId) !== String(user.id)) {
        // if peerId is not our peer or us, ignore
      }
      setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, readAt: new Date().toISOString() } : m));
    };

    const onTypingStart = ({ from }) => {
      if (String(from) === String(peer.id)) setPeerTyping(true);
    };
    const onTypingStop = ({ from }) => {
      if (String(from) === String(peer.id)) setPeerTyping(false);
    };

    socket.on('message:new', onNew);
    socket.on('message:read', onRead);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('message:new', onNew);
      socket.off('message:read', onRead);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, peer.id]);

  // auto-scroll when messages update
  useEffect(() => {
    // wait a tick for list to render
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  // typing debounce: emit start once, and stop after idle time
  useEffect(() => {
    if (!socket) return;
    if (text.length > 0) {
      socket.emit('typing:start', { to: peer.id });
      // stop typing after 1.2s of idle
      const t = setTimeout(() => socket.emit('typing:stop', { to: peer.id }), 1200);
      return () => clearTimeout(t);
    } else {
      // if text cleared, send stop
      socket.emit('typing:stop', { to: peer.id });
    }
  }, [text]);

  const send = () => {
    if (!text.trim()) return;
    const clientId = `local-${Date.now()}`;
    const payload = { to: peer.id, text: text.trim(), clientId };
    socket.emit('message:send', payload);
    // locally append a placeholder message — server will emit final message:new with id
    const optimistic = {
      id: clientId,
      from: user.id,
      to: peer.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null
    };
    setMessages(prev => [...prev, optimistic]);
    setText('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{peer.name}</Text>
        {peerTyping ? <Text style={styles.typing}>typing…</Text> : null}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MessageBubble msg={item} me={user} />}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type a message"
          value={text}
          onChangeText={setText}
          style={styles.input}
          multiline={false}
        />
        <Button title="Send" onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 12, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  headerText: { fontWeight: '700', fontSize: 16 },
  typing: { fontSize: 12, color: '#666', marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 }
});