import {xyz} from './xyz.js';
import {Atmos} from './imperial/atmos.js';
import {Bullet} from './imperial/bullet.js';
import trajectory from './imperial/traj.js';


const

el = id => document.getElementById(id),

inputs = {
	
	sight:{
		height: 2,
		offset: 0,
		los: 0,
		cant: 0
	},
	
	bullet:{ // 
		// weight: 175,
		// caliber: .308,
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
		inc: 100,
		zero:300,
		target:2000
	}
},

f = el("shot"),
zero = el("zero"),
target = el("target"),

pos = (el,{x,y}) => el.setAttribute('transform',`translate(${x} ${y})`),

read = input => input && (input.type === 'number' ? parseFloat(input.value) : input.value),
scan = (f,o) => Object.fromEntries( Object.keys(o).map( key => [ key, typeof o[key] === 'object' ? scan(f,o[key]) : read(f.querySelector(`input[name=${key}]`)) ] ) ),

MOA = Math.PI/(180*60),
click = 0.25*MOA,
rad2clicks = r => Math.round(r/click);
	
	
window.calculate = e => {
	
	//e.preventDefault();
	
	const shot = scan(f,inputs);
	
	shot.bullet = new Bullet(shot.bullet);
	shot.atmos = new Atmos(shot.atmos);
	
	pos(zero,{x:shot.range.zero/10,y:0});
	pos(target,{x:shot.range.target/10,y:0});
	
	const traj = trajectory(shot);
	el("trajectory").setAttribute("points",traj.trace.map( ({range,drop}) => `${Math.round(range/10)},${Math.round(drop*10)}` ).join(" "));
	
	el("elevation").textContent = rad2clicks(traj.knob.elevation);
	el("azimuth").textContent = rad2clicks(traj.knob.azimuth);
};	
	
// el("calc").addEventListener('click', calculate);