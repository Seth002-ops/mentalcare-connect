const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
  // Serve static files from public directory
  if (req.url === '/') {
    const filePath = path.join(PUBLIC_DIR, 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else {
    const filePath = path.join(PUBLIC_DIR, req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        if (ext === '.html') contentType = 'text/html';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.json') contentType = 'application/json';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  }
});

server.listen(PORT, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
