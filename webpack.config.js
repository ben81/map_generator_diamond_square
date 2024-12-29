const path = require('path');

module.exports = {
    entry: './src/main.js', // Point d'entrée de votre application
    output: {
        filename: 'bundle.js', // Nom du fichier de sortie
        path: path.resolve(__dirname, 'dist'), // Dossier de sortie
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Appliquer cette règle aux fichiers .js
                exclude: /node_modules/, // Exclure les fichiers dans node_modules
                use: {
                    loader: 'babel-loader', // Utiliser Babel pour transpiler le code
                },
            },
        ],
    },
	externals: {
	      // Spécifiez les dépendances à externaliser
	   //   'p5': 'p5',
	  //    'random': 'random',
	      // Ajoutez d'autres dépendances ici
	  },
	resolve: {
	     alias: {	     
	         '@p5': path.resolve(__dirname, 'node_modules/p5/lib/'), // Alias pour le dossier utils
	         '@random': path.resolve(__dirname, 'node_modules/random/dist/'), // Alias pour le dossier styles
	     },
	     extensions: ['.js', '.jsx', '.json'], // Extensions de fichiers à résoudre
	 },
	devtool: false, // Désactiver les source maps
    'mode' :  'development' 
	//'mode' :'production'
	
};