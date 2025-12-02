
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psyconnect.app',
  appName: 'PsyConnect',
  webDir: 'out',
  server: {
    // Reemplaza la siguiente URL con la URL que te dio Vercel (o cualquier otro hosting) después de desplegar.
    // Ejemplo: 'https://psyconnect-app.vercel.app'
    url: 'https://TU-URL-DE-PRODUCCION.vercel.app',
    cleartext: true,
  },
};

export default config;
