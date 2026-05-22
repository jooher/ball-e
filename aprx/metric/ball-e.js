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
		drift	: 62
	},	// :{drag}
	
	atmos	:{ // 
		m	: 1000,
		C	: 60,
		mbar	: 30,
		pc	: 50
	},	// :{kD,M}
	
//	wind	:null,

/*
	aim :{
		elevation: 0,
		azimuth: 0
	}
	
	range :{
		min: 0,
		inc: 100,
	}
*/
},

/*
MOA = Math.PI/(180*60),
click = 0.25*MOA,

rad2MOA = (r,unit) => Math.round(r/MOA/unit),
MOA2rad = (a,unit) => a*MOA,

rad2clicks = r => Math.round(r/click),
clicks2rad = c => click*c,

deg2radian = deg => deg && Math.PI/180 * parseFloat(deg),
*/

cent = one => one/100,

num = id=> parseFloat(el(id).value),

adjust = {
	height : cent, // cm => m
	los: deg2radian,
	pc: cent, // percent
	unit: parseFloat,
	elevation: MOA2rad,
	azimuth: MOA2rad,
};


const

f = el("shot"),
zero = el("zero"),
pin = el("pin"),

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


window.prepareshot = (e,shot) =>{
	if(!shot) shot = scan(f,inputs);
	shot.bullet = new Bullet(shot.bullet);
	shot.atmos = new Atmos(shot.atmos);
	return shot;
},

window.calculate = shot => {

	const	traj = shot.traj = trajectory(shot),
		unit = num("unit")/num("factor");
	
	pos(zero,{x:shot.sight.zero,y:0});
	pos(pin,{x:shot.sight.dist,y:0});
	
	el("atmos").textContent = shot.atmos.data;
	
	if(traj.knob){
		el("elevation").value = Math.round(unit*traj.knob.elevation),//rad2MOA(unit);
		el("azimuth").value = Math.round(unit*traj.knob.azimuth);
	}

	return shot;
};

const tgt=f.querySelector("[name=dist]");

draggable( el("oneshot"), el("pin"), {
	drag: T => {
		T.matrix.f = 0;
		tgt.value = Math.round(T.matrix.e);
	},
	end: T => {
		T.matrix.f = 0;
		f.submit();
	}
});