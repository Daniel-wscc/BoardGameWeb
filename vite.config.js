import { defineConfig } from 'vite';
import javascriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';
import path from 'path';

function copyAndObfuscate() {
  return {
    name: 'copy-and-obfuscate',
    apply: 'build',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');

      function copyRecursiveSync(src, dest) {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();
        if (isDirectory) {
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          fs.readdirSync(src).forEach(childItemName => {
            if (childItemName === 'index.html' && src === srcDir) return; // Vite already built index.html
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
          });
        } else {
          if (src.endsWith('.js')) {
            const content = fs.readFileSync(src, 'utf-8');
            const obfuscationResult = javascriptObfuscator.obfuscate(content, {
              compact: true,
              controlFlowFlattening: true,
              deadCodeInjection: false,
              stringArray: true,
              stringArrayEncoding: ['base64']
            });
            fs.writeFileSync(dest, obfuscationResult.getObfuscatedCode());
          } else {
            fs.copyFileSync(src, dest);
          }
        }
      }

      copyRecursiveSync(srcDir, distDir);
    }
  };
}

export default defineConfig({
  root: 'public',
  base: './',
  publicDir: false, // We will manually copy assets to avoid double-copying index.html
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [
    copyAndObfuscate()
  ]
});
