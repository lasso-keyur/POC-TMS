import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const appSrc = path.resolve(__dirname, './src')
const designSystemSrc = path.resolve(__dirname, '../teammate-voices-design-system/src')

export default defineConfig({
  plugins: [
    react(),
    // Resolve @/ imports based on which package they originate from
    {
      name: 'scoped-alias',
      resolveId(source, importer) {
        if (!source.startsWith('@/') || !importer) return null
        // If the importer is inside the design system, resolve @/ to design system src
        if (importer.includes('teammate-voices-design-system')) {
          const resolved = source.replace('@/', designSystemSrc + '/')
          return this.resolve(resolved, importer, { skipSelf: true })
        }
        // Otherwise resolve @/ to the app src
        const resolved = source.replace('@/', appSrc + '/')
        return this.resolve(resolved, importer, { skipSelf: true })
      },
    },
  ],
  server: {
    port: 5175,
    host: '0.0.0.0',
    fs: {
      allow: [
        path.resolve(__dirname, '..'),
      ],
    },
  },
  resolve: {
    alias: {
      '@teammate-voices/design-system': path.resolve(designSystemSrc, 'index.ts'),
    },
  },
})
