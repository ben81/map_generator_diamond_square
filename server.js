const { createServer } = require('server');
const path = require('path');

// Créer une instance du serveur
const server = require('server');

// Servir le contenu statique du dossier 'dist'
let http = require('http').createServer(function (req, res) {
  const filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  const ext = path.parse(filePath).ext;
  const map = {
    '.html': 'text/html',
    '.js': 'application/javascript',
	'.min.js': 'application/javascript',
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
  res.writeHead(200, { 'Content-Type': contentType });
  require('fs').createReadStream(filePath).pipe(res);
});

// Démarrer le serveur
const port = 3000;
http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
