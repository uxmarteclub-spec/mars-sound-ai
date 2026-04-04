import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const figmaPlaceholder = path.resolve(__dirname, './src/assets/placeholders/figma-placeholder.png')

/** Figma Make exports `figma:asset/*` imports; outside Make, map them to a local placeholder. */
function figmaAssetResolver(): Plugin {
  return {
    name: 'resolve-figma-asset',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        return figmaPlaceholder
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
