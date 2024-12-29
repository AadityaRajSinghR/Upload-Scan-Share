import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      headers: {
        'Content-Security-Policy':
          "default-src 'self'; connect-src 'self' https://www.virustotal.com https://www.bigfiles.virustotal.com; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
      }
    }
  }
})
