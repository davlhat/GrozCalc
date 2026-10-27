# GrozCalc Android test build (Windows 10/11)

GrozCalc uses **Capacitor 7** to run the existing React app inside a native Android WebView. This is an actual Android app installed via Android Studio/ADB, not a browser shortcut. It shares the existing Express/PostgreSQL backend. **The APK is not yet included in the repository**; the native Android project must be generated once on your Windows PC.

## Prerequisites

- Node.js 22+ (already installed for GrozCalc).
- Android Studio with Android SDK, Platform Tools (ADB), and an installed Android SDK platform. Install from the official Android developer website.
- A physical Android phone with **Developer options → USB debugging** enabled, connected via USB. Accept the debugging authorization prompt.
- Docker/PostgreSQL and the existing GrozCalc backend running on the development PC.

## 1. Install Android tooling (once)

In **Command Prompt** (CMD):

```cmd
cd C:\Windows\System32\GrozCalc
npm install
npm run build
npm run android:init
```

If the Android project already exists, **do not run android:init again**.

## 2. Start the backend (CMD window 1)

```cmd
cd C:\Windows\System32\GrozCalc\server
npm run dev
```

If `EADDRINUSE :3001` appears, an old backend is already running. **Do not start a second one.** To stop the existing listener in CMD (only if necessary):

```cmd
for /f "tokens=5" %a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /PID %a /F
```

Then start the backend once. The Android application and desktop website use the same database and accounts.

## 3. Start Vite (CMD window 2)

```cmd
cd C:\Windows\System32\GrozCalc
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

## 4. Connect phone over USB (CMD window 3)

```cmd
adb devices
adb reverse tcp:5173 tcp:5173
adb reverse tcp:3001 tcp:3001
```

If `adb` is not recognized, open Android Studio → SDK Manager → SDK Tools and install **Android SDK Platform-Tools**, then run `adb.exe` from your SDK `platform-tools` directory (often `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`). The phone should appear as `device`, not `unauthorized`.

The two `adb reverse` rules let the Android app reach your PC at `localhost:5173` and `localhost:3001`. This avoids exposing the database to your LAN and keeps local login cookies on localhost. USB must stay connected during this live development test.

## 5. Install and run the Android app (CMD window 3)

```cmd
cd C:\Windows\System32\GrozCalc
set GROZCALC_ANDROID_LIVE=1
npx cap sync android
npx cap run android
```

Select your connected Android device if prompted. If Gradle/Android SDK cannot be found, run `npm run android:open`, allow Android Studio to finish Gradle sync, select the phone and press **Run ▶**. After the app opens, log in normally. The backend must be running for SQL products, accounts and diary sync.

**Note:** This is a **development Android app**, not a standalone production APK. It loads the Vite server over the USB reverse tunnel. The app will not function independently of the development PC in this mode.

## 6. Later: standalone Android APK

For a standalone APK, stop using live mode:

```cmd
set GROZCALC_ANDROID_LIVE=
npm run android:sync
npm run android:open
```

Build an APK in Android Studio (Build → Build Bundle(s) / APK(s) → Build APK(s)). **Important:** The frontend currently defaults to `http://localhost:3001`; on a standalone phone this points to the phone, not your PC. Before a standalone APK can sign in and use the shared catalog, deploy the backend to an HTTPS address and build with `VITE_API_URL` pointing to it. Cross-origin cookie/CORS policy must be configured for the native origin; do not treat a bundled APK as production-ready until those flows are tested.

## Common issues

- **API offline:** Check the PC backend and `adb reverse tcp:3001 tcp:3001`.
- **Blank screen / connection refused:** Check Vite and `adb reverse tcp:5173 tcp:5173`.
- **Device unauthorized:** Unlock phone and accept the USB debugging prompt.
- **Port 3001 already in use:** Keep one backend process, not two.
- **Phone unplugged:** Reconnect USB and rerun both reverse commands; they may be lost after reconnecting.
- **Android SDK errors:** Open `android/` in Android Studio and install the requested SDK packages.
