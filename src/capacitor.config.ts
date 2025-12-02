import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psyconnect.app',
  appName: 'PsyConnect',
  webDir: 'out',
  server: {
    // Reemplaza la siguiente URL con la URL que te dio Firebase Hosting después de desplegar.
    // Esta es la clave para que el APK funcione.
    url: 'https://TU-PROYECTO.web.app',
    cleartext: true,
  },
};

export default config;
