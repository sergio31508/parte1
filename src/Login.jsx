import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission, subscribeToPush, sendSubscriptionToServer } from "./utils/pushNotifications";
import { API_URL } from "./config/api";

function Login() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Solicitar permiso de notificaciones al cargar
    requestNotificationPermission();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Suscribirse a notificaciones push
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          const subscription = await subscribeToPush();
          if (subscription && data.usuario?._id) {
            await sendSubscriptionToServer(subscription, data.usuario._id);
          }
        }

        // SI EL NOMBRE ES "admin" LO MANDA A /admin
        if (nombre.toLowerCase() === "admin") {
          navigate("/admin");
        } else {
          navigate("/catalogo");
        }
      } else {
        alert(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      alert("Error del servidor");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      /><br/>

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br/>

      <button onClick={handleLogin}>Iniciar sesión</button>

      <p onClick={() => navigate("/registro")}>¿No tienes cuenta? Regístrate</p>
    </div>
  );
}

export default Login;
