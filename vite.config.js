import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: 'electron/main.mjs',
      }
    })
  ],
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],

    esbuildOptions: {
      supported: {
        'top-level-await': true //browsers can handle top-level-await features
      },
    }
  },
  build: {
    target: 'esnext'
  }
})
