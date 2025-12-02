import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psyconnect.app',
  appName: 'PsyConnect',
  webDir: 'out',
  server: {
    // Reemplaza <TU_IP_LOCAL> con la IP de tu computadora en tu red WiFi.
    // Ejemplo: 'http://192.168.1.10:9003'
    // Puedes encontrar tu IP local ejecutando `ipconfig` en Windows o `ifconfig` en macOS/Linux.
    url: 'http://<TU_IP_LOCAL>:9003',
    cleartext: true,
  },
};

export default config;
