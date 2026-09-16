import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
let apiKey = '';
let port = 3000;

try {
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    const keyMatch = env.match(/NEWS_API_KEY=([a-zA-Z0-9]+)/);
    const portMatch = env.match(/PORT=([0-9]+)/);
    if (keyMatch) apiKey = keyMatch[1].trim();
    if (portMatch) port = parseInt(portMatch[1].trim(), 10);
  }
} catch (e) {
  console.warn('Could not read .env file:', e.message);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API Proxy endpoint: /api/news
  if (pathname === '/api/news') {
    const query = parsedUrl.searchParams.get('query') || 'indonesia';
    const sortBy = parsedUrl.searchParams.get('sortBy') || 'publishedAt';
    const pageSize = parsedUrl.searchParams.get('pageSize') || '40';

    if (!apiKey) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: 'NEWS_API_KEY is not set in .env' }));
      return;
    }

    try {
      const targetUrl = `https://newsapi.org/v2/everything?qInTitle=${encodeURIComponent(query)}&language=en&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${apiKey}`;
      const apiRes = await fetch(targetUrl);
      const data = await apiRes.json();
      res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: err.message }));
    }
    return;
  }

  // 2. Static file serving
  let relativeFilePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal
  const safePath = path.normalize(relativeFilePath).replace(/^(\.\.[\/\\])+/, '');
  const absoluteFilePath = path.join(__dirname, safePath);

  fs.stat(absoluteFilePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(absoluteFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(absoluteFilePath);
    stream.pipe(res);
  });
});

server.listen(port, () => {
  console.log(`\n IndoPress dev server running at: http://localhost:${port}`);
  console.log(` API Proxy: http://localhost:${port}/api/news\n`);
});
