

//import { p5 } from 'p5';
const p5 = require('p5')
//const random = require('random')

//import { Random } from './index.js'
import { ColorMap} from './colorMap.js'
import { Point} from './point.js'
import { findAndReplaceGroups} from './point.js'
import { Data} from './data.js'

import { Random } from 'random'



let SIZE;
let GRID_SIZE; // Final size map
let TILE_SIZE;
let RANGE_HEIGHT;
let RANGE_RANDOM;
let SHRINK_COEFF_RANDOM;
let FIX_HEIGHT_ALONE_POINT;
//--Interactive Mode--
let OFFSET_X;
let OFFSET_Y;
let INTERACTIVE_MODE; //If true, can see steps hitting RIGHT_ARROW

let grid;
let current_range_random;
let step;
let tmp_size;
let color_map;
let display_borders;
let rng;


let countcliff;
let data;

const sketch = (p) => {
	p.setup = function() {
		SIZE = 8; // !!! Should not exceed 8
		GRID_SIZE = 2 ** SIZE + 1; // Final size map
		TILE_SIZE = 3;
		RANGE_HEIGHT = [1, 16];
		RANGE_RANDOM = [-16, 16];
		SHRINK_COEFF_RANDOM = .42;
		FIX_HEIGHT_ALONE_POINT = 8; //cell surrounded by X different heights will be one of them
		//--Interactive Mode--
		OFFSET_X = 40;
		OFFSET_Y = 40;
		INTERACTIVE_MODE = false; //If true, can see steps hitting RIGHT_ARROW

		grid = [];
		current_range_random = [...RANGE_RANDOM];
		step = 1;
		tmp_size = GRID_SIZE; // for interactive mode
		color_map = new ColorMap();
		display_borders = true;
		rng = new Random();//('my-seed-string');

		let cvn = p.createCanvas(GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE);
		cvn.id('map');
		cvn.parent("left");

		//initGrid();

		if (!INTERACTIVE_MODE) {
			drawAll(true);

		}else{
			data= new Data(true);
			initGrid();
		}
	};
	
	p.redrawAll = function() {
		drawAll(false)
	}


	function drawAll(updateSeed) {


	
		
		 data= new Data(updateSeed,data!=null ? data.seedValue : 0);
		 RANGE_RANDOM = data.rangeRandom;
		 SHRINK_COEFF_RANDOM = data.rangeShrinkCoeff;
		
		rng = new Random(data.seedValue);

		step = 1;
		current_range_random = data.rangeRandom;// [...RANGE_RANDOM];
		color_map = new ColorMap();

		initGrid();
		calculateHeights(GRID_SIZE);
		normalizeGrid();
		computeCliff();
		fixHeightAlonePoints(FIX_HEIGHT_ALONE_POINT);
		computeCliff();



		drawHeightMap();
		generateBorders();
		color_map.setLegend(GRID_SIZE * GRID_SIZE, data.seedValue);
	}





	function initGrid() {

		for (let x = 0; x < GRID_SIZE; x++) {
			grid[x] = [];
			for (let y = 0; y < GRID_SIZE; y++) {
				grid[x][y] = new Point(x, y);
				//We set random height for corners
				if (
					(x == 0 && y == 0) ||
					(x == GRID_SIZE - 1 && y == 0) ||
					(x == GRID_SIZE - 1 && y == GRID_SIZE - 1) ||
					(x == 0 && y == GRID_SIZE - 1)
				) {
					grid[x][y].height = getRdmHeight();
				}
			}
		}
	}

	function squareStep(topX, topY, size) {

		let rd = getRdm();
		let index = {};

		index.x = (size + 1) / 2 + topX - 1;
		index.y = (size + 1) / 2 + topY - 1;
		grid[index.x][index.y].height = calculateAverage([

			grid[topX][topY].height, //top letf corner
			grid[topX + size - 1][topY].height, //top right corner
			grid[topX + size - 1][topY + size - 1].height, // bottom right corner
			grid[topX][topY + size - 1].height //bottom left corner
		]) + rd;
	}

	function diamondStep(topX, topY, size,) {

		let tl = grid[topX][topY].height; //top left
		let tr = grid[topX + size - 1][topY].height; //top right
		let br = grid[topX + size - 1][topY + size - 1].height; //bottom right
		let bl = grid[topX][topY + size - 1].height; // bottom left
		let center = grid[(size - 1) / 2 + topX][(size - 1) / 2 + topY].height //center

		//top
		let rd = getRdm();
		grid[(size - 1) / 2 + topX][topY].height = calculateAverage([tl, tr, center]) + rd;
		//right
		rd = getRdm();
		grid[topX + size - 1][(size - 1) / 2 + topY].height = calculateAverage([tr, br, center]) + rd;
		//bottom
		rd = getRdm();
		grid[(size - 1) / 2 + topX][size - 1 + topY].height = calculateAverage([br, bl, center]) + rd;
		//left
		rd = getRdm();
		grid[topX][(size - 1) / 2 + topY].height = calculateAverage([bl, tl, center]) + rd;
	}

	function shrinkRangeRandom() {

		current_range_random[0] = current_range_random[0] * SHRINK_COEFF_RANDOM;
		current_range_random[1] = current_range_random[1] * SHRINK_COEFF_RANDOM;
	}

	function calculateHeights(size) {

		for (let x = 0; x < 2 ** (step - 1); x++) {
			for (let y = 0; y < 2 ** (step - 1); y++) {
				squareStep(x * (size - 1), y * (size - 1), size);
				diamondStep(x * (size - 1), y * (size - 1), size);
			}
		}

		step++;
		shrinkRangeRandom();

		if (INTERACTIVE_MODE) {

			return ((size + 1) / 2);
		} else {

			if (size > 3) {
				calculateHeights((size + 1) / 2);
			}
		}
	}

	function drawHeightMap() {

		p.noStroke();
		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {

				let height = roundHeight(grid[x][y].height)
				let col = p.color(color_map.getHeightColor(height));
				p.fill(col);
				p.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}

	p.keyReleased = function() {
		let keyCode = p.keyCode;
		if (keyCode === p.RIGHT_ARROW && INTERACTIVE_MODE) {

			if (tmp_size >= 3) {
				tmp_size = calculateHeights(tmp_size);
				displayDebug();
			}
		}

		if (keyCode === p.SHIFT) {
			drawAll(true);
		}

		if (keyCode === 80){ //p.RETURN) {
			let timeStamp =
				p.year() + "-" + p.month() + "-" + p.day() +
				"-" + p.hour() + "-" + p.minute() + "-" + p.second()
				+ "-" + p.nf(p.millis(), 3, 0);

			p.save(timeStamp + '.png');
		}
		if (keyCode === 83){ //p.RETURN) {
			data.saveDB();	
		}

		//b key
		if (keyCode === 66) {

			display_borders = !display_borders;
			generateBorders();
		}
	}

	function generateBorders() {

		for (let cx = 0; cx < GRID_SIZE; cx++) {
			for (let cy = 0; cy < GRID_SIZE; cy++) {

				let height = roundHeight(grid[cx][cy].height);

				//we take four neigbours
				let north = { dir: "north", x: cx, y: cy - 1 };
				let east = { dir: "east", x: cx + 1, y: cy };
				let south = { dir: "south", x: cx, y: cy + 1 };
				let west = { dir: "west", x: cx - 1, y: cy };

				let neighbours = [north, east, south, west];

				neighbours.forEach(n => {

					//we only want a neighbour in the map and we don't want to border water
					if (n.x != -1 &&
						n.y != -1 &&
						n.x != GRID_SIZE &&
						n.y != GRID_SIZE &&
						roundHeight(grid[n.x][n.y].height) == height - 1 &&
						roundHeight(grid[n.x][n.y].height) >= 5
					) {
						let c;
						if (display_borders)
							c = ColorLuminance(color_map.getHeightColor(height), -.2)
						else
							c = color_map.getHeightColor(height);

						traceBorder(cx, cy, n.dir, c);
					}
				});
			}
		}
	}

	function traceBorder(x, y, dir, col) {
		let p1, p2;
		switch (dir) {

			case "north": {
				p1 = { x: x * TILE_SIZE, y: y * TILE_SIZE };
				p2 = { x: x * TILE_SIZE + TILE_SIZE, y: y * TILE_SIZE };
			}
				break;
			case "east": {
				p1 = { x: x * TILE_SIZE + TILE_SIZE, y: y * TILE_SIZE };
				p2 = { x: x * TILE_SIZE + TILE_SIZE, y: y * TILE_SIZE + TILE_SIZE };
			}
				break;
			case "south": {
				p1 = { x: x * TILE_SIZE, y: y * TILE_SIZE + TILE_SIZE };
				p2 = { x: x * TILE_SIZE + TILE_SIZE, y: y * TILE_SIZE + TILE_SIZE };
			}
				break;
			case "west": {
				p1 = { x: x * TILE_SIZE, y: y * TILE_SIZE };
				p2 = { x: x * TILE_SIZE, y: y * TILE_SIZE + TILE_SIZE };
			}
				break;
		}

		p.stroke(col);
		p.line(p1.x, p1.y, p2.x, p2.y);
	}


	function normalizeGrid() {

		let min = Math.min();
		let max = Math.max();
		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {
				let current_height = grid[x][y].height;
				min = Math.min(min, current_height);
				max = Math.max(max, current_height);
			}
		}
		let ratio = (RANGE_HEIGHT[1] - RANGE_HEIGHT[0]) / (max - min);

		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {
				let current_height = grid[x][y].height;
				let new_height = Math.round((current_height - min) * ratio + RANGE_HEIGHT[0]);
				grid[x][y].height = new_height;
			}
		}

	}

	function computeCliff() {
		countcliff=0;
		if (data.togglecliffValue) {
			let test=true;
		
			while (test){
				countcliff++;
				test=false;
				let secondaryGrid = [];
				for (let x = 0; x < GRID_SIZE; x++) {
					secondaryGrid[x] = [];
					for (let y = 0; y < GRID_SIZE; y++) {
						secondaryGrid[x][y] = new Point(x, y);
					}
				}
				for (let x = 1; x < GRID_SIZE - 1; x++) {
					for (let y = 1; y < GRID_SIZE - 1; y++) {
						if (checkPoint(grid[x - 1][y], grid[x][y], grid[x + 1][y]) ||
							checkPoint(grid[x][y - 1], grid[x][y], grid[x][y + 1]) ||
							checkPoint(grid[x - 1][y - 1], grid[x][y], grid[x + 1][y + 1]) ||
							checkPoint(grid[x - 1][y + 1], grid[x][y], grid[x + 1][y - 1]) ||
							
							checkPoint(grid[x - 1][y-1], grid[x][y], grid[x + 1][y]) ||
							checkPoint(grid[x - 1][y], grid[x][y], grid[x + 1][y-1]) ||
							checkPoint(grid[x - 1][y+1], grid[x][y], grid[x + 1][y]) ||
							checkPoint(grid[x - 1][y], grid[x][y], grid[x + 1][y+1]) ||
							
							checkPoint(grid[x-1][y - 1], grid[x][y], grid[x][y + 1]) ||
							checkPoint(grid[x][y - 1], grid[x][y], grid[x-1][y + 1]) ||
							checkPoint(grid[x+1][y - 1], grid[x][y], grid[x][y + 1]) ||
							checkPoint(grid[x][y - 1], grid[x][y], grid[x+1][y + 1]) 
							
							
						) {
							secondaryGrid[x][y].height = 1;
						}

					}
				}
				let l=findAndReplaceGroups(secondaryGrid, grid,rng);
				for (let x = 0; x < GRID_SIZE; x++) {
					for (let y = 0; y < GRID_SIZE ; y++) {
						if (secondaryGrid[x][y].height > 1) {
							///let d = (rng.int(0, 1) * 2 - 1);
							grid[x][y].height = l[secondaryGrid[x][y].height].rnd;
							// d;
							test=true;
						}
					}
				}
				if (countcliff>10){
					break;
				}
			}//while
		}
	}
	
	function checkPoint( pa, pb,  pc){	
		let ha=(pa.height);
		let hb=(pb.height);
		let hc=(pc.height);
		let p12=ha-hb;
		let p23=hb-hc;
		//let p13=ha-hc;
		if( p12>=1 && p23>=1 ){
			return true;
		}
		if( p12<=-1 && p23<=-1){
			return true;
		}
		return false;
	}

	
	function fixHeightAlonePoints(maxPoints) {

		if (data.togglefixHeightAlonePointsValue) {
			for (let x = 0; x < GRID_SIZE; x++) {
				for (let y = 0; y < GRID_SIZE; y++) {

					let current_height = roundHeight(grid[x][y].height);
					let neighbours = getNeighbours(x, y);
					let count = 0;
					let new_height;

					neighbours.forEach(el => {
						if (roundHeight(el.height) != current_height) {
							count++;
							new_height = el.height;
						}
					});

					//totally alone
					if (count >= maxPoints) { grid[x][y].height = new_height; }
				}
			}
		}
	}

	//Tools fctos
	function getNeighbours(cx, cy) {

		let res = [];

		for (let x = cx - 1; x <= cx + 1; x++) {
			for (let y = cy - 1; y <= cy + 1; y++) {
				// We don't want middle cell (this is cx and cy)
				if (x != 0 && y != 0) {
					//outside the map, so considers as a wall
					if (x != -1 && y != -1 && x != GRID_SIZE && y != GRID_SIZE)
						res.push(grid[x][y]);
				}
			}
		}

		return res
	}

	function getRndInteger(min, max) {
		//return Math.floor(Math.random() * (max - min + 1) ) + min;
		let value = rng.float() * (max - min + 1) + min;
		if (data.toggleRoundingValue)
			return Math.floor(value);
		else
			return value;
	}

	function getRdmHeight() {

		return getRndInteger(RANGE_HEIGHT[0], RANGE_HEIGHT[1]);
	}

	function getRdm() {

		return getRndInteger(current_range_random[0], current_range_random[1]);
	}

	function roundHeight(height) {

		if (INTERACTIVE_MODE) {
			let res = Math.round(height);

			if (res < RANGE_HEIGHT[0])
				return RANGE_HEIGHT[0];

			if (res > RANGE_HEIGHT[1])
				return RANGE_HEIGHT[1];
			return res;
		}
		else {
			return height;
		}
	}

	/*function debugGrid() {

		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {
				print(grid[x][y]);
			}
		}
	}*/

	function calculateAverage(array) {
		return (array.reduce((sum, current) => sum + current) / array.length);
	}

	function displayDebug() {

		p.createCanvas(1200, 800);

		let diameter = 20;
		let tile_size = 90;

		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {

				let posX = OFFSET_X + x * tile_size;
				let posY = OFFSET_Y + y * tile_size;

				p.fill('black');
				p.textSize(16);
				p.text("(" + x + "," + y + ")", posX - diameter / 2, posY - diameter);

				let c = (grid[x][y].height > 0) ? p.color(0, 204, 0) : p.color(204, 0, 0);
				p.fill(c);
				p.circle(posX, posY, diameter);

				p.fill('black');
				p.textSize(16);
				p.text((grid[x][y].height % 1 != 0) ? grid[x][y].height.toFixed(4) : grid[x][y].height, posX - diameter / 2, posY + diameter * 2);
			}
		}
	}

	function ColorLuminance(hex, lum) {
		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		lum = lum || 0;
		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i * 2, 2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00" + c).substr(c.length);
		}
		return rgb;
	}


};

let p5k=new p5(sketch);


export function toggleCheckbox(){
	p5k.redrawAll();
}

document.getElementById('rangeRandomMax').addEventListener('change', toggleCheckbox);
document.getElementById('toggleRounding').addEventListener('change', toggleCheckbox);
document.getElementById('togglefixHeightAlonePoints').addEventListener('change', toggleCheckbox);
document.getElementById('togglecliff').addEventListener('change', toggleCheckbox);
document.getElementById('rangeShrinkCoeffRandom').addEventListener('change', toggleCheckbox);
document.getElementById('toggleSort').addEventListener('change', toggleCheckbox);





document.addEventListener('DOMContentLoaded', () => {
    const rangeSlider = document.getElementById('rangeShrinkCoeffRandom');
    const tooltip = document.getElementById('tooltip');

    rangeSlider.addEventListener('input', () => {
        const value = event.target.value;
        tooltip.innerText = (value/100).toFixed(2);
        tooltip.style.display = 'block';
    });

    rangeSlider.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    rangeSlider.addEventListener('mouseover', () => {
        tooltip.style.display = 'block';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const rangeSlider = document.getElementById('rangeRandomMax');
    const tooltip = document.getElementById('tooltipRandomMax');

    rangeSlider.addEventListener('input', () => {
        const value = event.target.value;
        tooltip.innerText = (value);
        tooltip.style.display = 'block';
    });

    rangeSlider.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    rangeSlider.addEventListener('mouseover', () => {
        tooltip.style.display = 'block';
    });
});