import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'

export default defineConfig({
  ssr: {
    // prebuilds ssr.js so we can drop node_modules from the resulting container
    noExternal: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    RubyPlugin(),
  ],
})
