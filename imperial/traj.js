// based off https://www.jbmballistics.com/ballistics/downloads/binary/jbmcgi-2.1.tgz

import {xyz,len,add,sub} from '../xyz.js';

const
	g		= (32.17),
	GRAVITY	= xyz(0,-g,0),
	
	ERR	= (0.02/12.0), // ft?
	ERROR = ERR*ERR,
	
	MAXIT	= (10),
	
	MINVX	= (50.0),
	MINY	= (-2000/12.0),

	dx = 1,
	

tilt = ({
	los, // The angle between the line of sight and level ground. Positive shooting uphill, negative downhill
	cant // The angle of the tilt of the firearm to the right or left from vertical. Positive to the right
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
	sight,	// :{height,offset,los,cant},
	bullet,	// :{drag,weight,vm},
	atmos,	// :{kD,M}
	wind,
	range = {zero:300,min:100, max:4000, inc:100 },	
}) => {
	
// output	
//	elevation, //The vertical angle the barrel makes with the line of sight
//	azimuth, // The angle in a horizontal direction, positive to the shooter's right
	
	const
		adjust= tilt(sight),
		G	= adjust(GRAVITY),
		W	= wind && adjust(wind);
		
		//lead	= speed*Math.sin(angle);

	let	trace,
		error		= 1e9,
		azimuth	= 0, //(options & OPT.AZIM) ? 0.0 : azimuth, 
		elevation	= 0, //(options & OPT.ELEV)) ? 0.0 : elevation,
		i = MAXIT;
	  
	while( i-- && error>ERROR ){
		
		trace = [];
		
		const
			R = xyz( 0, -sight.height, -sight.offset ),
			V = xyz(
				Math.cos(elevation)*Math.cos(azimuth),
				Math.sin(elevation),
				Math.cos(elevation)*Math.sin(azimuth)
			).scale(bullet.vm); //xyz(vm,0,0), // 
			
		let	t = 0,
			mark = range.min;
		
		while (R.x<range.max && R.y>MINY && V.x>MINVX){
			
			const
				dt	= dx/V.x,
				va	= len( wind ? sub(V,W) : V ), // air velocity
				drag	= atmos.kD * bullet.drag(va/atmos.M)*dt,
				damp	= 1/(1-drag); // to have R.x rounded, let's expand V slightly
			
			V.app(V,-drag).app(G,dt);
			R.app(V,dt*damp);
			t += dt*damp;
			
			if(R.x>range.zero && error>ERROR){ // Adjust trajectory for zero elevation and azimuth...

				const 
					dy = R.y,
					dz = R.z;
					
				error = dy*dy + dz*dz;
					
				if (error>ERROR){
					elevation -= dy/R.x;
					azimuth -= dz/R.x;
					break;
				}
			}
			
			if ( R.x >= mark ){
				trace.push({
					range    : R.x,
					drop     : R.y,
					windage  : R.z,
					time     : t,
					velocity : va,
				});
				mark += range.inc;
			}
		}
	}
	return trace;
}