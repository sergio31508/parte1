// Utilidades para IndexedDB

const DB_NAME = 'pwa-catalogo-db';
const DB_VERSION = 1;
const STORE_USUARIOS = 'usuarios';
const STORE_CATALOGO = 'catalogo';
const STORE_NOTIFICACIONES = 'notificaciones';

let db = null;

// Inicializar la base de datos
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store para usuarios
      if (!database.objectStoreNames.contains(STORE_USUARIOS)) {
        const usuariosStore = database.createObjectStore(STORE_USUARIOS, { keyPath: '_id' });
        usuariosStore.createIndex('nombre', 'nombre', { unique: false });
      }

      // Store para catálogo
      if (!database.objectStoreNames.contains(STORE_CATALOGO)) {
        database.createObjectStore(STORE_CATALOGO, { keyPath: 'id' });
      }

      // Store para notificaciones
      if (!database.objectStoreNames.contains(STORE_NOTIFICACIONES)) {
        const notifStore = database.createObjectStore(STORE_NOTIFICACIONES, { keyPath: 'id', autoIncrement: true });
        notifStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Guardar usuarios en IndexedDB
export const saveUsuarios = async (usuarios) => {
  if (!db) await initDB();
  
  const transaction = db.transaction([STORE_USUARIOS], 'readwrite');
  const store = transaction.objectStore(STORE_USUARIOS);
  
  // Limpiar store antes de agregar nuevos
  await store.clear();
  
  usuarios.forEach(usuario => {
    store.put(usuario);
  });
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Obtener usuarios de IndexedDB
export const getUsuarios = async () => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_USUARIOS], 'readonly');
    const store = transaction.objectStore(STORE_USUARIOS);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Guardar notificación en IndexedDB
export const saveNotificacion = async (notificacion) => {
  if (!db) await initDB();
  
  const transaction = db.transaction([STORE_NOTIFICACIONES], 'readwrite');
  const store = transaction.objectStore(STORE_NOTIFICACIONES);
  
  const notifData = {
    ...notificacion,
    timestamp: new Date().getTime(),
    leida: false
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(notifData);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Obtener notificaciones de IndexedDB
export const getNotificaciones = async () => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NOTIFICACIONES], 'readonly');
    const store = transaction.objectStore(STORE_NOTIFICACIONES);
    const index = store.index('timestamp');
    const request = index.getAll();
    
    request.onsuccess = () => resolve(request.result.reverse()); // Más recientes primero
    request.onerror = () => reject(request.error);
  });
};

