import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config/api";
import { saveRegistroPendiente, eliminarRegistroSincronizado } from "./utils/indexedDB";
import { sincronizarRegistrosPendientes } from "./utils/syncService";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registrar = async () => {
    // Validar campos
    if (!nombre.trim() || !telefono.trim() || !password.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    const datosRegistro = { nombre, telefono, password };
    let registroIdEnIndexedDB = null;

    // SIEMPRE guardar en IndexedDB primero (por si falla la conexión)
    try {
      registroIdEnIndexedDB = await saveRegistroPendiente(datosRegistro);
      console.log("✅ Registro guardado en IndexedDB con ID:", registroIdEnIndexedDB);
    } catch (err) {
      console.error("❌ Error al guardar en IndexedDB:", err);
      alert("Error al guardar el registro localmente");
      return;
    }

    // Intentar guardar en el servidor si hay conexión
    if (navigator.onLine) {
      try {
        console.log("🌐 Intentando guardar en servidor...");
        const res = await fetch(`${API_URL}/api/usuarios/registrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosRegistro)
        });

        const data = await res.json();
        console.log("📡 Respuesta del servidor:", data);

        if (res.ok) {
          // Si se guardó exitosamente en el servidor, eliminar de IndexedDB
          if (registroIdEnIndexedDB) {
            try {
              await eliminarRegistroSincronizado(registroIdEnIndexedDB);
              console.log("✅ Registro eliminado de IndexedDB (ya está en servidor)");
            } catch (err) {
              console.error("⚠️ Error al eliminar de IndexedDB:", err);
            }
          }
          
          // Sincronizar cualquier otro registro pendiente
          console.log("🔄 Sincronizando otros registros pendientes...");
          const syncResult = await sincronizarRegistrosPendientes();
          console.log("📊 Resultado de sincronización:", syncResult);
          
          alert("✅ Registrado correctamente en el servidor");
          navigate("/");
        } else {
          console.error("❌ Error del servidor:", data.error);
          alert(data.error || "Error al registrarse. El registro se guardó localmente y se sincronizará cuando haya conexión.");
          // Limpiar campos para permitir otro intento
          setNombre("");
          setTelefono("");
          setPassword("");
        }
      } catch (err) {
        console.error("❌ Error de conexión:", err);
        alert("Error de conexión. El registro se guardó localmente y se sincronizará automáticamente cuando haya internet.");
        // Limpiar campos
        setNombre("");
        setTelefono("");
        setPassword("");
      }
    } else {
      // Sin conexión, solo guardado en IndexedDB
      console.log("📴 Sin conexión, registro guardado solo en IndexedDB");
      alert("Sin conexión. El registro se guardó localmente y se sincronizará automáticamente cuando haya internet.");
      // Limpiar campos
      setNombre("");
      setTelefono("");
      setPassword("");
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      
      <div style={{ 
        padding: "10px", 
        marginBottom: "10px", 
        borderRadius: "4px", 
        backgroundColor: isOnline ? "#d4edda" : "#fff3cd",
        color: isOnline ? "#155724" : "#856404",
        fontSize: "14px"
      }}>
        {isOnline ? "🟢 En línea - Se guardará en el servidor" : "🔴 Sin conexión - Se guardará localmente"}
      </div>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ padding: "8px", margin: "5px 0", width: "300px" }}
      /><br/>

      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        style={{ padding: "8px", margin: "5px 0", width: "300px" }}
      /><br/>

      <input
        type="text"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "8px", margin: "5px 0", width: "300px" }}
      /><br/>

      <button 
        onClick={registrar}
        style={{ 
          padding: "10px 20px", 
          marginTop: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Registrar
      </button>
    </div>
  );
}

export default Registro;
