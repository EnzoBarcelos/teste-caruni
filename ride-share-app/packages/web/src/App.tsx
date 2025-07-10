import React, { useState } from 'react';
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
    const { data } = await axios.get('http://localhost:3001/rides', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRides(data);
  };

  if (!token) {
    return (
      <div className="p-4">
        <h1 className="text-xl mb-2">Login</h1>
        <input className="border m-1" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border m-1" placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white px-2" onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl">Rides</h1>
      <button className="bg-green-500 text-white px-2" onClick={loadRides}>Load Rides</button>
      <ul>
        {rides.map(r => <li key={r.id}>{r.status}</li>)}
      </ul>
    </div>
  );
}
