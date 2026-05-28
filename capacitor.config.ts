/// <reference types="@capacitor/keyboard" />
import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.communeplus.app',
  appName: 'Commune Plus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'LIGHT',
      hidden: false,
      animation: 'NONE'
    },
    Keyboard: {
      resize: KeyboardResize.Ionic,
      resizeOnFullScreen: false
    }
  },
  splashScreen: {
    launchShowDuration: 2000,
    launchAutoHide: true,
    backgroundColor: '#ffffff',
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


