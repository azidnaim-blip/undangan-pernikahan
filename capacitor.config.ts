import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://brewpoint-pos.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.brewpoint.pos',
  appName: 'BrewPoint POS',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#181615',
      showSpinner: false,
    },
  },
};

export default config;
