import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function UserListItem({ user, online, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width:10, height:10, borderRadius:5, backgroundColor: online ? 'green' : 'gray' }} />
      <View style={{ flex:1 }}>
        <Text style={{ fontWeight: '600' }}>{user.name}</Text>
        {!!user.lastMessageText && <Text numberOfLines={1} style={{ color:'#666' }}>{user.lastMessageText}</Text>}
      </View>
      {user.lastMessageAt && <Text style={{ color:'#999', fontSize:12 }}>{new Date(user.lastMessageAt).toLocaleTimeString()}</Text>}
    </TouchableOpacity>
  );
}