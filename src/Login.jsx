import { useState } from 'react';

function Login({ onLogin }) {
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (telefono.trim() && password.trim()) {
      // Aquí iría la llamada a tu API
      console.log('Login:', { telefono, password });
      onLogin(); 
    } else {
      alert('Por favor ingresa todos los campos');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Ingresar</button>
    </form>
  );
}

export default Login;
