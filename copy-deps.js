const ncp = require('ncp').ncp;
const fs = require('fs');
const path = require('path');

// Fonction pour lister les dépendances de production
const getProductionDependencies = () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return Object.keys(packageJson.dependencies || {});
};

// Copier les dépendances de production
const copyDependencies = () => {
    const dependencies = getProductionDependencies();
    dependencies.forEach(dep => {
        ncp(path.join('node_modules', dep), path.join('dist', 'node_modules', dep), err => {
            if (err) {
                console.error(`Error copying ${dep}:`, err);
            } else {
                console.log(`Copied ${dep} to dist/node_modules`);
            }
        });
    });
};

copyDependencies();