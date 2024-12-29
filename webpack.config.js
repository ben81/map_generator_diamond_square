const path = require('path');

module.exports = {
    entry: './src/main.js', 
    output: {
        filename: 'bundle.js', // Nom du fichier de sortie
        path: path.resolve(__dirname, 'dist'), // Dossier de sortie
    },
    module: {
        rules: [
            {
                test: /\.js$/, 
                exclude: /node_modules/, // Exclure les fichiers dans node_modules
                use: {
                    loader: 'babel-loader', // Utiliser Babel pour transpiler le code
                },
            },
        ],
    },
	externals: {
	      
	   //   'p5': 'p5',
	  //    'random': 'random',
	      // 
	  },
	resolve: {
	     alias: {	     
	         '@p5': path.resolve(__dirname, 'node_modules/p5/lib/'), // Alias pour le dossier utils
	         '@random': path.resolve(__dirname, 'node_modules/random/dist/'), // Alias pour le dossier styles
			 '@dexie': path.resolve(__dirname,'node_modules/dexie/dist/')
	     },
	     extensions: ['.js', '.jsx', '.json'], // Extensions de fichiers a resoudre
	 },
	devtool: false, // Desactiver les source maps
    'mode' :  'development' 
	//'mode' :'production'
	
};