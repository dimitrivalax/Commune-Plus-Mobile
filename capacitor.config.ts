import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.okmairie.app',
  appName: 'OK Mairie',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;


