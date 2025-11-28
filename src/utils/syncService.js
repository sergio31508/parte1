// Servicio de sincronización offline
import { API_URL } from '../config/api';
import { 
  getRegistrosPendientes, 
  marcarRegistroSincronizado, 
  eliminarRegistroSincronizado 
} from './indexedDB';

// Sincronizar registros pendientes con el servidor
export const sincronizarRegistrosPendientes = async () => {
  if (!navigator.onLine) {
    console.log('❌ Sin conexión, no se puede sincronizar');
    return { success: false, message: 'Sin conexión', sincronizados: 0, errores: 0 };
  }

  try {
    console.log('🔄 Obteniendo registros pendientes...');
    const pendientes = await getRegistrosPendientes();
    console.log(`📋 Registros pendientes encontrados: ${pendientes.length}`);
    
    if (pendientes.length === 0) {
      console.log('✅ No hay registros pendientes para sincronizar');
      return { success: true, message: 'No hay registros pendientes', sincronizados: 0, errores: 0 };
    }

    let sincronizados = 0;
    let errores = 0;

    for (const registro of pendientes) {
      try {
        const { id, timestamp, sincronizado, ...datosRegistro } = registro;
        console.log(`🔄 Sincronizando registro ID ${id}:`, datosRegistro.nombre);
        
        const res = await fetch(`${API_URL}/api/usuarios/registrar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosRegistro)
        });

        const data = await res.json();

        if (res.ok) {
          await eliminarRegistroSincronizado(id);
          sincronizados++;
          console.log(`✅ Registro sincronizado exitosamente: ${datosRegistro.nombre}`);
        } else {
          console.error(`❌ Error al sincronizar registro ${id}:`, data.error || 'Error desconocido');
          errores++;
        }
      } catch (err) {
        console.error(`❌ Error al sincronizar registro ${registro.id}:`, err);
        errores++;
      }
    }

    console.log(`📊 Sincronización completada: ${sincronizados} exitosos, ${errores} errores`);
    return { 
      success: true, 
      message: `Sincronizados: ${sincronizados}, Errores: ${errores}`,
      sincronizados,
      errores
    };
  } catch (err) {
    console.error('❌ Error al obtener registros pendientes:', err);
    return { success: false, message: err.message, sincronizados: 0, errores: 0 };
  }
};

// Inicializar el servicio de sincronización
export const initSyncService = () => {
  // Sincronizar cuando se conecte a internet
  window.addEventListener('online', async () => {
    console.log('Conexión restaurada, sincronizando...');
    const resultado = await sincronizarRegistrosPendientes();
    if (resultado.sincronizados > 0) {
      console.log(`✅ ${resultado.sincronizados} registro(s) sincronizado(s)`);
    }
  });

  // Intentar sincronizar al cargar la página si hay conexión
  if (navigator.onLine) {
    setTimeout(async () => {
      const resultado = await sincronizarRegistrosPendientes();
      if (resultado.sincronizados > 0) {
        console.log(`✅ ${resultado.sincronizados} registro(s) sincronizado(s)`);
      }
    }, 2000); // Esperar 2 segundos para que la página cargue
  }
};

