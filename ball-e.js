import {Atmos} from './imperial/atmos.js';
import {Bullet} from './imperial/bullet.js';
import trajectory from './imperial/traj.js';

const
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
	
traj = trajectory(shot);

document.getElementById("trajectory").setAttribute("points",traj.trace.map({ran})

console.log(traj.trace);
