import { app, BrowserWindow, safeStorage, systemPreferences, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null

async function createWindow() {
  win = new BrowserWindow()


  if (VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    await win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  console.log(`Requesting microphone permission`)
  const status = await systemPreferences.askForMediaAccess('microphone');
  const status2 = systemPreferences.getMediaAccessStatus('microphone')
  console.log(status2)
  if (!status && process.platform === 'darwin') {
    shell.openExternal(`x-apple.systempreferences:com.apple.preference.security?Privacy_microphone`);
  }

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders!['Cross-Origin-Opener-Policy'] = ['same-origin'];
    details.responseHeaders!['Cross-Origin-Embedder-Policy'] = ['require-corp'];
    callback({ responseHeaders: details.responseHeaders });
  });



  // @ts-ignore
  win["safeStorage"] = safeStorage
}

app.whenReady().then(createWindow)
