// This script copies dist/index.html to dist/404.html after build for GitHub Pages SPA routing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexFile = path.join(distDir, 'index.html');
const notFoundFile = path.join(distDir, '404.html');

if (fs.existsSync(indexFile)) {
  fs.copyFileSync(indexFile, notFoundFile);
  console.log('404.html created for SPA routing.');
} else {
  console.error('index.html not found. Build the project first.');
  process.exit(1);
}
