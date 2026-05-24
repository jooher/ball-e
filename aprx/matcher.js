//import "./metric/ball-e.js";
import {xyz} from './xyz.js';
import {Bullet} from './bullet.js';
import {Atmos} from './metric/atmos.js';
import trajectory from './metric/traj.js';
import draggable from './dragsvg.js';
import {translation} from './dragsvg.js';
import {normalize,fitD} from "./approximator2.js";

const

DEGREE = 4,

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

},

deg2radian = deg => deg && Math.PI/180 * parseFloat(deg),
cent = one => one/100,
num = id=> parseFloat(el(id).value),

adjust = {
	height : cent, // cm => m
	los: deg2radian,
	pc: cent, // percent
};


const

points = (el,trace ) => el.setAttribute("points",trace.map( ({x,y}) => `${x.toFixed(4)},${y.toFixed(4)}` ).join(" ")),

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

trigger = () =>{

	const shot = calculate(prepareshot()),
		traj = shot.traj,
		trace = traj.trace;
	
	points( el("trajectory"), trace);
	points( el("para"), trace.map( traj.para ) );
	points( el("drop"), trace.map( traj.drop ) );
},

scan = (f,o) => Object.fromEntries( Object.keys(o).map( key => [ key, typeof o[key] === 'object' ? scan(f,o[key]) : read(key) ] ) ),
pos = (el,{x,y}) => {translation(el).setTranslate(x,y)},

prepareshot = (e,shot) =>{
	if(!shot) shot = scan(f,inputs);
	shot.bullet = new Bullet(shot.bullet);
	shot.atmos = new Atmos(shot.atmos);
	return shot;
},

calculate = shot => {
	const	traj = shot.traj = trajectory(shot);
	pos(zero,{x:shot.sight.zero,y:0});
	pos(pin,{x:shot.sight.dist,y:0});
	el("atmos").textContent = shot.atmos.data;
	knob = traj.knob;
	showKnob();
	return shot;
},

showKnob = e => {
	if(!knob)return;
	const unit = num("unit")/num("factor");
	el("elevation").value = Math.round(unit*knob.elevation),//rad2MOA(unit);
	el("azimuth").value = Math.round(unit*knob.azimuth);
};

el("factor").onchange = el("unit").onchange = showKnob;

let 
	knob=null,
	kY = 1;

const

stats={},

plot = (key,min,max,stat) =>{
	const svg = el("weights"),
		pl = svg.firstElementChild.cloneNode(false),
		sX = 1/max,
//		sY = 1/20 // absolute scale, where 20 is expected max
		sY = 1/Math.max(stat.at(0).y,stat.at(-1).y) // normalized
		;
	pl.classList.add(key);
	pl.setAttribute('transform',`scale(${sX},${sY})`);
	pl.addEventListener('click',approximate);
	points(pl,stat);
	svg.append(pl);
},

row = e =>{
	const param	= e.target,
		key	= param.name,
		value	= parseFloat(param.value),
		step	= parseFloat(param.step),
		min	= value - DEGREE * step,//parseFloat(param.min),
		max	= value + DEGREE * step;//parseFloat(param.max),
/*	
		stat	= [];
	
	for(let x=min, count=DEGREE+1+DEGREE; count--; x+=step){
		param.value = x;
		const {drop,trace } = calculate(prepareshot()).traj;
		stat.push({x,y:drop(trace.at(-1)).y}); //test(prepareshot())
	}
	stats[key] = stat; //console.log()
*/
		
	stats[key] = Array.from({length:DEGREE+1+DEGREE}, (_,i)=> {
		const x = param.value = min+step*i,
			{drop,trace } = calculate(prepareshot()).traj;
		return {x, y:drop(trace.at(-1)).y}
	});
	param.value = value; // restore original value
	
	plot(key,min,max,stats[key]);	
};


const
poly = (kx,K,ky) => x => ky*K.reduceRight( (a,k) => a*x * kx+k ),

ab2sin = (a,b) =>{
	const
	dx=b.x-a.x,
	dy=b.y-a.y,
	h = Math.sqrt(dx*dx+dy*dy);
	return dy/h;
};


const
f = el("shot"),
zero = el("zero"),
pin = el("pin"),
tgt=f.querySelector("[name=dist]");

f.addEventListener("submit", e => {
	e.preventDefault();
	trigger();
});

f.querySelectorAll("input").forEach( i => {
	i.ondblclick = row;
	i.onchange = trigger;
} );

draggable( el("oneshot"), el("pin"), {
	drag: T => { tgt.value = Math.round(T.matrix.e) },
	end: trigger //T => { trigger() }
});

trigger();


// approximation

const

approximate = e => {
	
	const p = e.target.getAttribute('points').split(" ").map(str=>str.split(",").map(parseFloat)),
		N = normalize(p),
		K = fitD( N.D, DEGREE );
		
	el("coefs").textContent=`
X0: ${N.X0}
kX: ${N.kX}

Y0: ${N.Y0}
kY: ${N.kY}

K:
${K.join("\n")}
`;
	console.table(N);
	console.table(K);
	
	el("approx")
};


// configs in localStorage

const


listSetups = () => {
	el("mysetups")?.replaceChildren( ...Object.keys(localStorage).map( key => {
			const o = document.createElement("option");
			o.value = o.textContent = key;
			return o;
		})
	)
},

store = (key,json) => {
	localStorage.setItem(key,json);
	listSetups();
},

recall = key => {
	const obj = JSON.parse(localStorage.getItem(key));		
	for(const key in obj)
		Object.assign(f.querySelector(`input[name=${key}]`), obj[key] );
};


el("setupselect")?.addEventListener("change", e => { recall(e.target.value) });
listSetups();


el("grab")?.addEventListener("click", e => {
	
	const cb = navigator.clipboard,
	
		json = JSON.stringify( Object.fromEntries(

		[...f.querySelectorAll("input[type=number]")]
		.map( n => [
		n.name,{
			value:n.value,
			step:n.step
		}]))).replace(/"[a-z]+":"",*/g,"").replace(/,+}/g,"}");
		
	cb?.writeText(json);
	
	const	key = prompt("Remember this setup as:");
	
	if(key)
		cb ? cb.readText().then( json => store(key,json) ) : store(key,json);
	
});
		
