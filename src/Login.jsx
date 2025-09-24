// src/Login.jsx
import { useState } from 'react';

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (!phone.trim() || !password.trim()) {
      setErr('Completa todos los campos');
      return;
    }
    // Validación simple (diseño). Aquí solo guardamos el "usuario"
    const user = { phone, name: 'Usuario de prueba' };
    if (remember) localStorage.setItem('user', JSON.stringify(user));
    else sessionStorage.setItem('user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#eef2ff,#f8fafc)'
    }}>
      <form onSubmit={submit} style={{
        width: 340, padding: 24, background:'#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(2,6,23,0.08)'
      }}>
        <h2 style={{margin:0, marginBottom:12}}>Iniciar sesión</h2>

        <label style={{display:'block', marginBottom:8}}>Teléfono
          <input value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%',padding:10,marginTop:6, borderRadius:8, border:'1px solid #e6eef8'}} />
        </label>

        <label style={{display:'block', marginBottom:8}}>Contraseña
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:10,marginTop:6, borderRadius:8, border:'1px solid #e6eef8'}} />
        </label>

        <label style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
          <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
          Recordarme
        </label>

        <button type="submit" style={{width:'100%',padding:10, borderRadius:8, background:'#2563eb', color:'#fff', border:'none', cursor:'pointer'}}>
          Entrar
        </button>

        {err && <p style={{color:'crimson', marginTop:12}}>{err}</p>}
      </form>
    </div>
  );
}
