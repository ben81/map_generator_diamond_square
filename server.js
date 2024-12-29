const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Route pour gérer les fichiers spécifiques
app.get('*', (req, res) => {
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
      res.status(404).send('<h1>404 Not Found</h1>');
    } else {
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});