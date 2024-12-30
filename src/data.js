
import Dexie from 'dexie';
import { Random } from 'random'
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import {toggleCheckbox} from './main.js';


const db = new Dexie('configurations');

export class Data {

	constructor(updateSeed, oldseed) {


		if (updateSeed) {
			this.seedValue = document.getElementById("seed").value;
			if (this.seedValue == '') {
				this.seedValue = "" + new Random().int(0, 2 ** 64 - 1);
			}
		} else {
			this.seedValue = oldseed;
		}

		this.toggleRoundingValue = getToggleValue('toggleRounding');
		this.togglefixHeightAlonePointsValue = getToggleValue('togglefixHeightAlonePoints');
		this.togglecliffValue = getToggleValue('togglecliff');
		this.rangeRandomMaxValue = getRangeValue('rangeRandomMax');
		this.rangeRandom = [-this.rangeRandomMaxValue, this.rangeRandomMaxValue];
		this.rangeShrinkCoeffRandomValue = getRangeValue('rangeShrinkCoeffRandom');
		this.rangeShrinkCoeff = this.rangeShrinkCoeffRandomValue / 100;



	};

	restore() {

	};

	saveDB() {
		if (this.id == null) {
			this.name = "name" + this.seedValue;
			db.configure.add(this).then(function(id) {
				console.log('Data added with id:', id);
			}).catch(function(err) {
				console.error(err);
			});
			let data = table.getData();
			data.push(this);
			table.setData(data);
		}
	}
}


export function getToggleValue(id) {
	let toggle = document.getElementById(id);
	return toggle.checked;

}


export function getRangeValue(id) {
	let range = document.getElementById(id);
	return range.value;
}

export function setToggleValue(id, checked) {
	let toggle = document.getElementById(id);
	toggle.checked = checked;

}


export function setRangeValue(id, value) {
	let range = document.getElementById(id);
	range.value = value;
}



db.version(1).stores({
	configure: '++id,name,toggleRoundingValue,togglefixHeightAlonePointsValue,togglecliffValue,rangeRandomMaxValue,rangeShrinkCoeffRandomValue'
});


db.open().catch(function(err) {
	console.error('Failed to open db: ' + (err.stack || err));
});

let table;

function deleteRow(row){
	console.log('To Record deleted with id:', row.getData().id);
	db.configure.delete(row.getData().id).then(function() {
		console.log('Record deleted with id:', row.getData().id);
	}).catch(function(err) {
		console.error('Error deleting record:', err);
	});
	row.delete();
}


function applyRow(rowData){
	
	
	setRangeValue("seed",rowData.seedValue);	
	setToggleValue('toggleRounding',rowData.toggleRoundingValue);
	setToggleValue('togglefixHeightAlonePoints', rowData.togglefixHeightAlonePointsValue);
	setToggleValue('togglecliff',rowData.togglecliffValue);
	setRangeValue('rangeRandomMax',rowData.rangeRandomMaxValue);
	setRangeValue('rangeShrinkCoeffRandom',rowData.rangeShrinkCoeffRandomValue);
	toggleCheckbox();
}

db.configure.toArray().then(function(data) {
	console.log('All items in the table:', data);

	
	
	

	
	table = new Tabulator("#example-table", {
		resizableColumnFit: true,
		data: data,
		columns: [
			//{title:"id", field:"id", sorter:"number"},
			{ title: "name", field: "name", sorter: "string"},
			{ title: "seedValue", field: "seedValue", sorter: "number" },
			{ title: "rangeRandomMax", field: "rangeRandomMaxValue", sorter: "number"},
			{ title: "Rounding", field: "toggleRoundingValue", sorter: "boolean" },			
			{ title: "togglefixHeightAlonePoints", field: "togglefixHeightAlonePointsValue", sorter: "boolean" },
			{ title: "togglecliff", field: "togglecliffValue", sorter: "boolean"},
			{ title: "rangeShrinkCoeffRandom", field: "rangeShrinkCoeffRandomValue", sorter: "number" },

		],
	
		layout:"fitColumns",
		popupContainer:"#modal-div", //append menu to this element
	
			rowContextMenu: function(e, row) {
			       e.preventDefault();
			       const menu = document.getElementById("context-menu");
			       menu.style.display = "block";
			       menu.style.left = e.clientX + "px";
			       menu.style.top = e.clientY + "px";

			       // Ajouter des gestionnaires d'événements pour les éléments du menu
			       const items = menu.getElementsByTagName("li");
				items.forEach(function(element) {
					element.onclick = function(e) {
						const action = e.target.getAttribute("data-action");
						if (action === "apply") {
							applyRow(row.getData());
						} else if (action === "delete") {
							deleteRow(row);
						}
						menu.style.display = "none";
					};
				});


			       // Masquer le menu contextuel lorsque l'utilisateur clique en dehors
			       document.addEventListener("click", function() {
			           menu.style.display = "none";
			       }, { once: true });
			   },

	});
	//////table.setHeight(500)





});






