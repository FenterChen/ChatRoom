import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path"
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs'

export default defineConfig({
  plugins: [vue(), createHtmlPlugin({
    minify: true,
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  base: "/ChatRoom/",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].${Date.now()}.js`,
        chunkFileNames: `assets/[name].${Date.now()}.js`,
        assetFileNames: `assets/[name].${Date.now()}.[ext]`
      }
    }
  }
  , server: {
    https: {
      key: fs.readFileSync(`${__dirname}/src/assets/cert/key.pem`),
      cert: fs.readFileSync(`${__dirname}/src/assets/cert/cert.pem`),
    },
  },
})
