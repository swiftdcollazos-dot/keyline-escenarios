import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: funciona en GitHub Pages bajo /keyline-escenarios/ y en cualquier carpeta.
export default defineConfig({
  base: './',
  plugins: [react()],
})
