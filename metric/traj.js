// based off https://www.jbmballistics.com/ballistics/downloads/binary/jbmcgi-2.1.tgz

import {xyz,len,add,sub} from '../xyz.js';

const
	g	= 9.81, // m/s2
	
	ERR	= .05, // cm
	ERROR = ERR*ERR,
	MAXIT	= 10,
	
	MINVX	= 100, // m/s
	MINY	= -100, // m

	dx = 1, // m,
	

tilt = ({
	los = 0, // The angle between the line of sight and level ground. Positive shooting uphill, negative downhill
	cant = 0 // The angle of the tilt of the firearm to the right or left from vertical. Positive to the right
	}) => {
	const
		cl = Math.cos(los),
		sl = Math.sin(los),
		cc = Math.cos(cant),
		sc = Math.sin(cant);
		
	return ({x,y,z}) => {
		const tmp = y*cl-x*sl;
		return xyz( x*cl+y*sl, tmp*cc+z*sc, z*cc-tmp*sc);
	}
};


export default ({
	sight,	// :{height,los,zero,dist},
	bullet,	// :{drag,weight,vm},
	atmos,	// :{kD,M}
	wind,
	range = {min:0, inc:20 },
	aim: {azimuth = 0, elevation = 0}
}) => {
	
	const	// rotate gravity and wind into the sight space
		rot	= tilt(sight),
		G	= rot(xyz(0,-g,0)),
		W	= wind && rot(wind);
		
		//lead	= speed*Math.sin(angle);

	let	trace,
		knob,
		error		= 1e9,
		reach = Math.max(sight.zero, sight.dist),
		i = MAXIT;
	  
	while( i-- && error>ERROR ){
		
		trace = [];
		knob = null;
		
		const
			R = xyz( 0, -sight.height, -sight.offset ),
			V = xyz(
				Math.cos(elevation)*Math.cos(azimuth),
				Math.sin(elevation),
				Math.cos(elevation)*Math.sin(azimuth)
			).scale(bullet.vm); //xyz(vm,0,0), // 
			
		let	t = 0,
			mark = range.min;
		
		while (R.x<reach && R.y>MINY && V.x>MINVX){
			
			const
				dt	= dx/V.x,
				va	= len( wind ? sub(V,W) : V ), // air velocity
				drag	= atmos.kD * bullet.drag(va/atmos.M)*dt, // * caliber^2 / weight
				damp	= 1/(1-drag); // to have R.x rounded, let's expand V slightly
			
			V.app(V,-drag).app(G,dt);
			R.app(V,dt*damp);
			t += dt*damp;
			
			if(R.x >= sight.zero && !knob)
				knob = { elevation:R.y/R.x, azimuth:R.z/R.x }
						
			if ( R.x >= mark ){
				trace.push({
					range    : R.x,
					drop     : R.y,
					windage  : R.z,
					time     : t,
					velocity : va,
				});
				mark += range.inc||10;
			}
		}
		const 
			dy = R.y,
			dz = R.z;
			
		error = dy*dy + dz*dz;
		
		elevation -= .75 * dy/R.x;
		azimuth -= .75 * dz/R.x;
		
	}
	return { trace, knob, error };
}