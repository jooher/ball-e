import {xyz} from './xyz.js';
import {Bullet} from './bullet.js';
import {Atmos} from './metric/atmos.js';
import trajectory from './metric/traj.js';


const

el = id => document.getElementById(id),

inputs = {
	
	sight:{
		height: 5,
		los: 0,
		zero: 100,
		dist: 300
	},
	
	bullet:{ // 
		// weight: 175,
		// caliber: .308,
		bc	: 0.25,
		G	:"G7",
		vm	: 800,
		drift	: 62
	},	// :{drag}
	
	atmos	:{ // 
		m	: 0,
		C	: 15,
		pc	: 50,
		mbar	: null
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

MOA = Math.PI/(180*60),
click = 0.25*MOA,
rad2clicks = r => Math.round(r/click),

points = (polyline,data) =>{
	polyline.setAttribute("points",data.map( ({x,y}) => `${Math.round(x)},${Math.round(y)}` ).join(" "));
};
	
window.prepareshot = e =>{
	const shot = scan(f,inputs);
	shot.bullet = new Bullet(shot.bullet);
	shot.atmos = new Atmos(shot.atmos);
	return shot;
},

window.calculate = shot => {
	
	const traj = shot.traj = trajectory(shot);
	
	points(el("trajectory"),traj.trace);
	pos(zero,{x:shot.range.zero,y:0});
	pos(target,{x:shot.range.target,y:0});
	el("elevation").textContent = rad2clicks(traj.knob.elevation);
	el("azimuth").textContent = rad2clicks(traj.knob.azimuth);
	
	return shot;
};