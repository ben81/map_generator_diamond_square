const http = require('http');
const path = require('path');
const fs = require('fs');

// Créer une instance du serveur
const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  const ext = path.parse(filePath).ext;
  const map = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
  };

  const contentType = map[ext] || 'text/html';
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

// Démarrer le serveur
const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});