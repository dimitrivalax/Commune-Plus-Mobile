import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.okmairie.app',
  appName: 'OK Mairie',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  splashScreen: {
    launchShowDuration: 2000,
    launchAutoHide: true,
    backgroundColor: '#2563eb', // Couleur de fond (couleur primaire)
    androidSplashResourceName: 'splash',
    androidScaleType: 'CENTER_CROP',
    showSpinner: false, // On utilise notre propre spinner dans le composant
    iosSpinnerStyle: 'small',
    spinnerColor: '#ffffff',
    splashFullScreen: true,
    splashImmersive: true
  }
};

export default config;


