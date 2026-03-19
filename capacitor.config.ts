import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.communeplus.app',
  appName: 'Commune Plus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  splashScreen: {
    launchShowDuration: 2000,
    launchAutoHide: true,
    backgroundColor: '#ffffff', // Couleur de fond (blanc pour correspondre à l'icône)
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


