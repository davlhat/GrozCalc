import type { CapacitorConfig } from '@capacitor/cli';

// USB testing: Android's localhost is forwarded to the development PC via adb reverse.
// Never ship an APK with GROZCALC_ANDROID_LIVE=1; it points to a dev server.
const live = process.env.GROZCALC_ANDROID_LIVE === '1';
const config: CapacitorConfig = {
  appId: 'lv.grozcalc.app',
  appName: 'GrozCalc',
  webDir: 'dist',
  ...(live ? { server: { url: 'http://localhost:5173', cleartext: true } } : {}),
};
export default config;
