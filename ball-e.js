import {xyz} from './xyz.js';
import {Atmos} from './imperial/atmos.js';
import {Bullet} from './imperial/bullet.js';
import trajectory from './imperial/traj.js';



const

/*
shot ={
	sight:{
		height: 2,
		offset: 0
	},
	
	aim	:{
		los: 0,
		cant: 0
	},
	
	bullet:new Bullet({ // 
		weight: 30,
		vm	: 3500,
		bc	: 0.5,
		G	:"G7",
	}),	// :{drag}
	
	atmos	:new Atmos({ // 
		ft	: 1000,
		F	: 60,
		inHg	: 30,
		pc	: 50
	}),	// :{kD,M}
	
	wind	:null,
//
	zero	:{
		x:300,
		y:0,
		z:0
	},
	
	target:{
		range	: 1000, //ft
		speed	: 0,
		angle	: 0
	}
},
*/

	f = document.getElementById("shot"),
	
	read = input => input && (input.type === 'number' ? parseFloat(input.value) : input.value),
			
	scan = o => Object.fromEntries( Object.keys(o).map( key => [ key, typeof o[key] === 'object' ? scan(o[key]) : read(f.querySelector(`input[name=${key}]`)) ] ) );
	
	const
	
	inputs = {
		
		sight:{
			height: 2,
			offset: 0,
			los: 0,
			cant: 0
		},
		
		bullet:{ // 
			weight: 30,
			vm	: 3500,
			bc	: 0.5,
			G	:"G7",
		},	// :{drag}
		
		atmos	:{ // 
			ft	: 1000,
			F	: 60,
			inHg	: 30,
			pc	: 50
		},	// :{kD,M}
		
	//	wind	:null,
	//
		range :{
			min: 100,
			max: 3000,
			inc: 100,
			zero:300
		}
	},
	
	test = {
		
		sight:{
			height: 2,
			offset: 0,
			los: 0,
			cant: 0
		},
		
		bullet:new Bullet({ // 
			weight: 30,
			vm	: 3500,
			bc	: 0.5,
			G	:"G7",
		}),	// :{drag}
		
		atmos	:new Atmos({ // 
			ft	: 1000,
			F	: 60,
			inHg	: 30,
			pc	: 50
		}),	// :{kD,M}
		
	//	wind	:null,
	//
	
		range :{
			min: 100,
			max: 4000,
			inc: 100,
			zero:300
		}
		
	};
	

	
	
document.getElementById("calc").addEventListener('click', e => {
	
	e.preventDefault();
	
	let shot = scan(inputs);
	
	shot.bullet = new Bullet(shot.bullet);
	shot.atmos = new Atmos(shot.atmos);
	
	const trace = trajectory(shot);
	console.log(trace);
	document.getElementById("trajectory").setAttribute("points",trace.map( ({range,drop}) => `${Math.round(range/10)},${Math.round(drop*10)}` ).join(" "));
})

	

