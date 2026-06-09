// Tiny live-reload dev server. Run from anywhere: `node scripts/dev-server.mjs`.
// Serves the project root (parent of scripts/) and auto-refreshes the browser
// when any .html / .css / .js file changes. No dependencies.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5178;
const DEFAULT_FILE = 'index.html';

const clients = new Set();

const RELOAD_SNIPPET = `
<script>
(function(){
  const es = new EventSource('/__livereload');
  es.onmessage = () => location.reload();
  es.onerror = () => { /* server restarting; browser will retry automatically */ };
})();
</script>`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('retry: 500\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/' + DEFAULT_FILE;
  const filePath = path.join(ROOT, urlPath);

  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404); res.end('Not found'); return;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') {
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.includes('</body>')
      ? html.replace('</body>', RELOAD_SNIPPET + '\n</body>')
      : html + RELOAD_SNIPPET;
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    res.end(html);
  } else {
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => { res.destroy(); });
    stream.pipe(res);
  }
});

let debounce = null;
fs.watch(ROOT, { recursive: false }, (_evt, filename) => {
  if (!filename || !/\.(html|css|js)$/.test(filename)) return;
  if (filename === path.basename(fileURLToPath(import.meta.url))) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    for (const res of clients) res.write('data: reload\n\n');
  }, 60);
});

server.listen(PORT, () => {
  console.log(`Live preview: http://localhost:${PORT}/`);
});
