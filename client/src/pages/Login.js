import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try { await login(email.trim(), password); }
    catch (e) { Alert.alert('Login failed', e.message); }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome back</Text>
      <TextInput placeholder="Email" autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8, borderRadius: 8 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 8, borderRadius: 8 }} />
      <Button title="Login" onPress={onLogin} />
      <Text onPress={() => navigation.navigate('Register')} style={{ color: 'blue', marginTop: 8 }}>Create account</Text>
    </View>
  );
}