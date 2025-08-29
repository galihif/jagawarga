// file: app/admin/page.tsx
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const CORRECT_PASSWORD = "jagawarga-mvp"; 

  // Pindahkan EditorMap ke dalam dynamic import
  const EditorMap = useMemo(() => dynamic(
    () => import('@/src/components/EditorMap'),
    { ssr: false }
  ), []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert('Password salah!');
    }
  };

  if (isLoggedIn) {
    // Tampilkan peta jika sudah login
    return <EditorMap />;
  }

  return (
    // Form login tetap sama
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Login Admin JagaWarga</h1>
      <form onSubmit={handleLogin}>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>Login</button>
      </form>
    </div>
  );
}