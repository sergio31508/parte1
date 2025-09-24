// src/App.jsx
import { useState } from 'react';
import Login from './Login';

function MainApp({ user, onLogout }) {
  return (
    <div style={{ padding: 20 }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1>Mi App (logeado como {user.name})</h1>
        <button onClick={onLogout}>Cerrar sesión</button>
      </header>
      <main>
        <p>Contenido protegido — aquí va la interfaz principal.</p>
      </main>
    </div>
  );
}

function App() {
  const stored = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
  const [user, setUser] = useState(stored);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return <MainApp user={user} onLogout={handleLogout} />;
}

export default App;
