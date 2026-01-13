
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.footpath.freedom',
  appName: 'Footpath to Freedom',
  webDir: '.', // Pointing to root as index.html is there. Change to 'dist' if using a builder.
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
