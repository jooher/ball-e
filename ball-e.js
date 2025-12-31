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

	form = document.getElementById("shot"),
	
	fromInput = key => form.querySelector('input[name=`${key}`]')?.value,
	
	makeForm = o => Object.keys(o).map( key=>{ 
	const i = o[key];
	return el( "section", {name:key},
		Object.keys(i).map( key => el( "input", {
				type:number,
				name:key,
				value:i[key]
			}
		)))}),
		
	takeForm = o => Object.fromEntries(
	
		Object.keys(o).map( key => {
			const section=o[key];
			return [
				key, 
				Object.fromEntries( 
					Object.keys(section).map( key => [
						key,
						fromInput(key)
					])
				)
			]
		})
	);
	
	let
	
	shot = {
		sight:{
			height: 2,
			offset: 0
		},
		
		aim	:{
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
	};
	
	
form.addEventListener('submit', e=>{
	
	shot = takeForm(shot);
	
	shot.bullet = new Bullet(shot.bullet);
	shot.atmos = new Atmos(shot.atmos);
	
	traj = trajectory(shot);
	console.log(traj.trace);
	document.getElementById("trajectory").setAttribute("points",traj.trace.map( ({range,drop}) => `${Math.round(range/10)},${Math.round(drop*10)}` ).join(" "));
})

	

