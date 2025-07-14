import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.siriusgames.SiriusGames',
  appName: 'Sirius Games',
  webDir: 'www',
  server: {
    url: 'https://siriusgames.ru',
    cleartext: false
  }
};

export default config;
