import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config/api";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const registrar = async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registrado correctamente");
        navigate("/");
      } else {
        alert(data.error || "Error al registrarse");
      }
    } catch (err) {
      alert("Error del servidor");
    }
  };

  return (
    <div>
      <h2>Registro</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      /><br/>

      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      /><br/>

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br/>

      <button onClick={registrar}>Registrar</button>
    </div>
  );
}

export default Registro;
