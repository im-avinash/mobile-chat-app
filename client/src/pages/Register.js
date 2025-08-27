import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try { await register(name.trim(), email.trim(), password); }
    catch (e) { Alert.alert('Register failed', e.message); }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Create account</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth:1, padding:8, borderRadius:8 }} />
      <TextInput placeholder="Email" autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={setEmail} style={{ borderWidth:1, padding:8, borderRadius:8 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth:1, padding:8, borderRadius:8 }} />
      <Button title="Register" onPress={onRegister} />
      <Text onPress={() => navigation.navigate('Login')} style={{ color: 'blue', marginTop: 8 }}>Have an account? Login</Text>
    </View>
  );
}