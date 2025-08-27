import React from 'react';
import { View, Text } from 'react-native';
import { formatTime } from '../utils/time'


export default function MessageBubble({ msg, me }) {
  const mine = String(msg.from) === String(me.id);
  const status = msg.readAt ? '✓✓' : msg.deliveredAt ? '✓' : '';
  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: mine ? '#DCF8C6' : '#fff', marginVertical: 4, padding: 8, borderRadius: 8, maxWidth: '80%', borderWidth: 1, borderColor: '#eee' }}>
      <Text>{msg.text}</Text>
      <Text style={{ fontSize: 10, color: '#666', alignSelf: 'flex-end' }}>
        {formatTime(msg.createdAt)} {mine ? status : ''}
      </Text>
    </View>
  );
}