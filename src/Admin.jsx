import React, { useEffect, useState } from "react";
import axios from "axios";
import { saveUsuarios, getUsuarios } from "./utils/indexedDB";
import { API_URL } from "./config/api";

const Admin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [notificacion, setNotificacion] = useState("");
  const [notificaciones, setNotificaciones] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("todos");
  const [titulo, setTitulo] = useState("");

  // Traer usuarios desde la API al cargar el componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/usuarios`);
        setUsuarios(res.data);
        // Guardar en IndexedDB para offline
        await saveUsuarios(res.data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        // Intentar cargar desde IndexedDB si falla la red
        const usuariosOffline = await getUsuarios();
        if (usuariosOffline.length > 0) {
          setUsuarios(usuariosOffline);
        }
      }
    };
    fetchUsuarios();
  }, []);

  // Manejar envío de notificación
  const handleEnviarNotificacion = async (e) => {
    e.preventDefault();
    if (notificacion.trim() === "" || titulo.trim() === "") {
      alert("Por favor completa el título y el mensaje");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/usuarios/enviar-notificacion`, {
        usuarioId: usuarioSeleccionado === "todos" ? null : usuarioSeleccionado,
        titulo: titulo,
        mensaje: notificacion
      });

      if (res.data.success) {
        alert("Notificación enviada correctamente");
        setNotificaciones([...notificaciones, { titulo, mensaje: notificacion, usuario: usuarioSeleccionado }]);
        setNotificacion("");
        setTitulo("");
        setUsuarioSeleccionado("todos");
      }
    } catch (err) {
      console.error("Error al enviar notificación:", err);
      alert("Error al enviar notificación");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel Admin</h1>

      {/* Tabla de usuarios */}
      <h2>Usuarios registrados</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u._id}>
              <td>{u.nombre}</td>
              <td>{u.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario de notificaciones */}
      <h2 style={{ marginTop: "30px" }}>Enviar Notificaciones Push</h2>
      <form onSubmit={handleEnviarNotificacion} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Seleccionar usuario:</label>
          <select
            value={usuarioSeleccionado}
            onChange={(e) => setUsuarioSeleccionado(e.target.value)}
            style={{ padding: "5px", width: "300px" }}
          >
            <option value="todos">Todos los usuarios</option>
            {usuarios.map((u) => (
              <option key={u._id} value={u._id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título de la notificación"
            style={{ padding: "5px", width: "300px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <textarea
            value={notificacion}
            onChange={(e) => setNotificacion(e.target.value)}
            placeholder="Mensaje de la notificación"
            style={{ padding: "5px", width: "300px", minHeight: "80px" }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Enviar Notificación
        </button>
      </form>

      {/* Mostrar notificaciones enviadas */}
      {notificaciones.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Notificaciones Enviadas</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notificaciones.map((n, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9"
                }}
              >
                <strong>{n.titulo}</strong>
                <p style={{ margin: "5px 0" }}>{n.mensaje}</p>
                <small style={{ color: "#666" }}>
                  Para: {n.usuario === "todos" ? "Todos los usuarios" : usuarios.find(u => u._id === n.usuario)?.nombre || "Usuario"}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
