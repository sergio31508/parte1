import { useEffect, useState } from "react";

export default function Catalogo() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Array de imágenes del catálogo
  const imagenes = [
    { id: 1, src: "/img/cat1-1.jpg", nombre: "Categoría 1 - Imagen 1" },
    { id: 2, src: "/img/cat1-2.jpg", nombre: "Categoría 1 - Imagen 2" },
    { id: 3, src: "/img/cat1-3.jpg", nombre: "Categoría 1 - Imagen 3" },
    { id: 4, src: "/img/cat2-1.jpg", nombre: "Categoría 2 - Imagen 1" },
    { id: 5, src: "/img/cat2-2.jpg", nombre: "Categoría 2 - Imagen 2" },
    { id: 6, src: "/img/cat2-3.jpg", nombre: "Categoría 2 - Imagen 3" },
    { id: 7, src: "/img/cat3-1.jpg", nombre: "Categoría 3 - Imagen 1" },
    { id: 8, src: "/img/cat3-2.jpg", nombre: "Categoría 3 - Imagen 2" },
    { id: 9, src: "/img/cat3-3.jpg", nombre: "Categoría 3 - Imagen 3" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Bienvenido al catálogo</h1>
        <div style={{ 
          padding: "5px 10px", 
          borderRadius: "4px", 
          backgroundColor: isOnline ? "#4caf50" : "#f44336",
          color: "white",
          fontSize: "14px"
        }}>
          {isOnline ? "🟢 En línea" : "🔴 Sin conexión"}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {imagenes.map((imagen) => (
          <div
            key={imagen.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={imagen.src}
              alt={imagen.nombre}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div style={{ padding: "10px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                {imagen.nombre}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
