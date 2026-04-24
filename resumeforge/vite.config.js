import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'Resume_Forge_Warm.png', 'Resume_Forge_Dark.png'],
      manifest: {
        name: 'ResumeForge',
        short_name: 'ResumeForge',
        description: 'AI-powered resume builder',
        theme_color: '#6366f1',
        background_color: '#0f0f13',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/Resume_Forge_Dark.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Resume_Forge_Dark.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})