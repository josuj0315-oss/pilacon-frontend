import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'force-charset',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // HTML 및 문서 요청에 대해 명시적으로 UTF-8 인코딩을 강제 지정합니다.
          if (req.url === '/' || req.url.endsWith('.html') || req.headers.accept?.includes('text/html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
          }
          next()
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
