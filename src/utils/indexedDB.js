// Utilidades para IndexedDB

const DB_NAME = 'pwa-catalogo-db';
const DB_VERSION = 2; // Incrementar versión para agregar nuevo store
const STORE_USUARIOS = 'usuarios';
const STORE_CATALOGO = 'catalogo';
const STORE_NOTIFICACIONES = 'notificaciones';
const STORE_REGISTROS_PENDIENTES = 'registros_pendientes';

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
      const oldVersion = event.oldVersion;

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

      // Store para registros pendientes de sincronizar (nuevo en versión 2)
      if (oldVersion < 2 && !database.objectStoreNames.contains(STORE_REGISTROS_PENDIENTES)) {
        const pendientesStore = database.createObjectStore(STORE_REGISTROS_PENDIENTES, { keyPath: 'id', autoIncrement: true });
        pendientesStore.createIndex('timestamp', 'timestamp', { unique: false });
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

// Guardar registro pendiente en IndexedDB
export const saveRegistroPendiente = async (datosRegistro) => {
  if (!db) await initDB();
  
  const transaction = db.transaction([STORE_REGISTROS_PENDIENTES], 'readwrite');
  const store = transaction.objectStore(STORE_REGISTROS_PENDIENTES);
  
  const registroData = {
    ...datosRegistro,
    timestamp: new Date().getTime(),
    sincronizado: false
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(registroData);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Obtener registros pendientes de IndexedDB
export const getRegistrosPendientes = async () => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_REGISTROS_PENDIENTES], 'readonly');
    const store = transaction.objectStore(STORE_REGISTROS_PENDIENTES);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const pendientes = request.result.filter(r => !r.sincronizado);
      resolve(pendientes);
    };
    request.onerror = () => reject(request.error);
  });
};

// Marcar registro como sincronizado
export const marcarRegistroSincronizado = async (id) => {
  if (!db) await initDB();
  
  const transaction = db.transaction([STORE_REGISTROS_PENDIENTES], 'readwrite');
  const store = transaction.objectStore(STORE_REGISTROS_PENDIENTES);
  
  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const registro = getRequest.result;
      if (registro) {
        registro.sincronizado = true;
        const putRequest = store.put(registro);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Eliminar registro sincronizado
export const eliminarRegistroSincronizado = async (id) => {
  if (!db) await initDB();
  
  const transaction = db.transaction([STORE_REGISTROS_PENDIENTES], 'readwrite');
  const store = transaction.objectStore(STORE_REGISTROS_PENDIENTES);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

