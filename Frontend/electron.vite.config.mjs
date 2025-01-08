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
      headers: {
        'Content-Security-Policy':
          "default-src 'self'; connect-src 'self' http://localhost:3000 https://www.virustotal.com https://bigfiles.virustotal.com ; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://qrcode.tec-it.com"
      }
    }
  }
})


