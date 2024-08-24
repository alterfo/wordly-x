import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      renderer: process.env.NODE_ENV === 'test'
        // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
        ? undefined
        : {},
    }),
    {
      name: 'configure-response-headers',
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Permissions-Policy', 'microphone=(self)')
          next()
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['sqlocal'],
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
