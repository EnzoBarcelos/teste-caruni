import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import axios from 'axios';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [rides, setRides] = useState<any[]>([]);

  const login = async () => {
    const { data } = await axios.post('http://localhost:3001/login', { email, password });
    setToken(data.token);
  };

  const loadRides = async () => {
    const { data } = await axios.get('http://localhost:3001/rides', { headers: { Authorization: `Bearer ${token}` } });
    setRides(data);
  };

  if (!token) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Login</Text>
        <TextInput placeholder="email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginVertical: 4 }} />
        <TextInput placeholder="password" value={password} secureTextEntry onChangeText={setPassword} style={{ borderWidth: 1, marginVertical: 4 }} />
        <Button title="Login" onPress={login} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Button title="Load Rides" onPress={loadRides} />
      <FlatList
        data={rides}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <Text>{item.status}</Text>}
      />
    </View>
  );
}
