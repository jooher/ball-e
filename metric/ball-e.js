import {xyz} from '../xyz.js';
import {Bullet} from '../bullet.js';
import {Atmos} from './atmos.js';
import trajectory from './traj.js';
import draggable from '../dragsvg.js';


const

el = id => document.getElementById(id),

inputs = {
	
	sight:{
/*		
		offset: 0,
		cant: 0
*/
		height: 2,
		los: 0,
		zero:100,
		dist:1000
	},
	
	bullet:{ // 
		// weight: 175,
		// caliber: .308,
		G	:"G7",
		bc	: 0.5,
		vm	: 3500,
	},	// :{drag}
	
	atmos	:{ // 
		m	: 1000,
		C	: 60,
		mbar	: 30,
		pc	: 50
	},	// :{kD,M}
	
	aim :{
		elevation: 0,
		azimuth: 0
	}
	
//	wind	:null,
/*
	range :{
		min: 0,
		inc: 100,
	}
*/
},

MOA = Math.PI/(180*60),
click = 0.25*MOA,

rad2MOA = r => Math.round(r/MOA),
MOA2rad = a => a*MOA,

rad2clicks = r => Math.round(r/click),
clicks2rad = c => click*c,

deg2radian = deg => deg && Math.PI/180 * parseFloat(deg),
cent = one => one/100,

adjust = {
	height : cent, // cm => m
	los: deg2radian,
	pc: cent, // percent
	elevation: MOA2rad,
	azimuth: MOA2rad
};


const

f = el("shot"),
zero = el("zero"),
dist = el("dist"),

pos = (el,{x,y}) => el.setAttribute('transform',`translate(${x} ${y})`),

read = name => {
	const input = f.querySelector(`[name=${name}]`);
	if(!input)
		return console.warn(`No input: ${name}`);
	
	const v = input.value,
		h = adjust[name];

	return input.type !== 'number' ? v :
		!v ? null :
		!h ? parseFloat(v) :
		h(parseFloat(v));
},

scan = (f,o) => Object.fromEntries( Object.keys(o).map( key => [ key, typeof o[key] === 'object' ? scan(f,o[key]) : read(key) ] ) );


	
window.calculate = e => {
	
	//e.preventDefault();
	
	const shot = scan(f,inputs);
		
	shot.bullet = new Bullet(shot.bullet);
	shot.atmos = new Atmos(shot.atmos);
	
	pos(zero,{x:shot.sight.zero/10,y:0});
	pos(dist,{x:shot.sight.dist/10,y:0});
	
	const traj = trajectory(shot);
	el("trajectory").setAttribute("points",traj.trace.map( ({range,drop}) => `${Math.round(range/10)},${Math.round(drop*200)/100}` ).join(" "));
	
	el("elevation").value = rad2MOA(traj.knob.elevation);
	el("azimuth").value = rad2MOA(traj.knob.azimuth);
};

draggable(window.svg,{
	end: T => {
		T.matrix.f = 0;
		f.querySelector('[name=dist]').value = Math.round(T.matrix.e) * 10;
		f.submit();
	}
});
	
	
// el("calc").addEventListener('click', calculate);