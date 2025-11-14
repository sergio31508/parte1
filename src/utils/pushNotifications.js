// Utilidades para notificaciones push
import { API_URL } from '../config/api';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const subscribeToPush = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker no soportado');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BA_z1j1-VAWf4Sh964XeLejBuTl-9nqFjlw_E130UEGKUqyb621qcFLey_7bQWtu62Auj9Azn313FH8Uu4azyyE'
      )
    });

    return subscription;
  } catch (err) {
    console.error('Error al suscribirse:', err);
    return null;
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const sendSubscriptionToServer = async (subscription, userId) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, userId })
    });
    return res.json();
  } catch (err) {
    console.error('Error al enviar suscripción:', err);
    return null;
  }
};

