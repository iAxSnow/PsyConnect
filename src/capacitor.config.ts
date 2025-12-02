import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psyconnect.app',
  appName: 'PsyConnect',
  webDir: 'out',
  server: {
    // Reemplaza <TU_IP_LOCAL> con la dirección IP de tu computadora en tu red local.
    // Ejemplo: 'http://192.168.1.10:9003'
    // ¡IMPORTANTE! Esto es para pruebas locales. Tu teléfono y PC deben estar en la misma red WiFi.
    url: 'http://<TU_IP_LOCAL>:9003',
    cleartext: true,
  },
};

export default config;
