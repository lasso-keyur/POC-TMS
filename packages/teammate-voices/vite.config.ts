import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const designSystemSrc = path.resolve(__dirname, '../arya-design-system/src')

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
  },
  resolve: {
    alias: [
      // Design system source import (must come first)
      { find: '@arya/design-system', replacement: path.resolve(designSystemSrc, 'index.ts') },
      // Design system internal aliases (used inside the design system components)
      { find: /^@\/utils$/, replacement: path.resolve(designSystemSrc, 'utils') },
      { find: /^@\/tokens$/, replacement: path.resolve(designSystemSrc, 'tokens') },
      { find: /^@\/components$/, replacement: path.resolve(designSystemSrc, 'components') },
      // App source alias - must come after design system specific aliases
      { find: '@/', replacement: path.resolve(__dirname, './src') + '/' },
    ],
  },
})
