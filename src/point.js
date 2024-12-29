export class Point {

	constructor(x, y, h = 0) {

		this.posX = x;
		this.posY = y;
		this.height = h;
	}
}

export class Cliff {

	constructor(groupId) {

		this.groupId = groupId;
		this.min = Math.min();
		this.max = Math.max();
	}

	addPoint(point) {
		this.min = Math.min(this.min, point);
		this.max = Math.max(this.max, point);
	}
}


export function findAndReplaceGroups(_secondary, grid, rng) {
	let cliff = _secondary;
	const rows = cliff.length;
	const cols = cliff[0].length;
	let groupId = 2; // Commencer à partir de 2 pour les groupes
	let array = [new Cliff(0), new Cliff(2)];

	// Fonction de parcours en profondeur (DFS)
	function dfs(x, y, acliff) {
		// Vérifier les limites de la grille
		if (x < 0 || x >= rows || y < 0 || y >= cols || cliff[x][y].height !== 1) {
			return;
		}
		// Marquer la cellule avec l'ID du groupe
		cliff[x][y].height = acliff.groupId;
		acliff.addPoint(grid[x][y].height);

		// Parcourir les voisins
		dfs(x - 1, y, acliff); // Haut
		dfs(x + 1, y, acliff); // Bas
		dfs(x, y - 1, acliff); // Gauche
		dfs(x, y + 1, acliff); // Droite

		dfs(x - 1, y - 1, acliff); // Haut Gauche
		dfs(x + 1, y - 1, acliff); // Bas Gauche
		dfs(x - 1, y + 1, acliff); // Haut Droite
		dfs(x + 1, y + 1, acliff); // Bas Droite
	}

	// Parcourir toute la grille
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			if (cliff[i][j].height === 1) {
				// Commencer un nouveau groupe
				let acliff = new Cliff(groupId);
				array.push(acliff);
				dfs(i, j, acliff);
				groupId++;
			}
		}
	}
	array.forEach(function(c) {
		if (rng.boolean()) {
			c.rnd = c.max + 1;
		}
		else {
			c.rnd = c.min - 1;
		}
	});
	return array;
}