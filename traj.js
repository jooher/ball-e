const
	DX	= (3.0),
	ERROR	= (0.02/12.0),
	NSTEPS	= (100),
	MINCHRONO	= (0.1),
	
	MAXV	= (5000.0),
	MINV	= (50.0),
	MINY	= (-1999.9/12.0),
	
	MAXRANGE	= (2000),
	MAXITCNT	= (10),

	GM		= (-32.17),
	GM7k		= GM*7000.0,
	GRAVITY	= (vector(0.0, GM, 0.0)),
	
	LEAD		= (t, s, a) => t*s*Math.sin(a),
	ENERGY	= (w, v) =>  -0.5*w*v*v/GM7k,
	MOMENTUM	= (w, v) => w*v/GM7k,

OPT = {
	AZIM	: 0x01,
	ELEV	: 0x02,
	ALTI	: 0x04,
	MOA	: 0x08,
	MIL	: 0x10,
	IN	: 0x20,
	BASIC	: 0x40,
},





tilt = ({los,cant}) => ({
	cl = Math.cos(los),
	sl = Math.sin(los),
	cc = Math.cos(cant),
	sc = Math.sin(cant);
}),

gravity = ({cl,sl,cc,sc}) => vector(GM*sl, GM*cl*cc, -GM*cl*sc),

wind(wind,tilt)
{
	const
		{cl,sl,cc,sc}=tilt,
		tmp = wind.y*cl - wind.x*sl,
		w = vector(wind.x*cl + wind.y*sl, tmp*cc + wind.z*sc, wind.z*cc - tmp*sc);
		
	w.x = MPHTOFPS(w.x);
	w.y = MPHTOFPS(w.y);
	w.z = MPHTOFPS(w.z);
	
	return w;
}

velocity({atmos,bullet})
{
	let v = trajectory.velocity;
	if (trajectory.chronodist > MINCHRONO){
		const
			dx = -trajectory.chronodist/NSTEPS,
			eq = dx*atmos.density/ATMOS_DENSSTD;
			
		for (let i=0; i<NSTEPS && v<MAXV; i++){
			const
				vm = v/atmos.mach,
				tv = v - 0.5*eq*v*bc_getdrag(bullet.bc, vm),
				m = tv/atmos.mach;
			
			v = v - eq*tv*bc_getdrag(bullet.bc, m);
		}
	}
	return v;
}



calculate({zero,speed,angle,tilt,azimuth,elevation,atmos,range,sight,bullet,options})
{
	const
		z	= vector(zero.x*DX, INTOFT(zero.y), INTOFT(zero.z));
		azim	= (options & OPT.AZIM) ? 0.0 : azimuth;
		elev	= (options & OPT.ELEV)) ? 0.0 : elevation;
		mach	= atmos.mach;
		eq	= atmos.density/ATMOS_DENSSTD;
		g	= gravity(tilt);
		w	= wind(trajectory);
		mv	= velocity(trajectory);

		lead	= speed*Math.sin(angle)


		 

		if ( options & OPT_ALTI ) atmos_standardalt(atmos);
		atmos_atmos(atmos);


		i = (range.max - range.min + 1) / range.inc + 1;
		ranges = malloc(i*RANGE_SIZE);


		let
		err = 0.0;
		itcnt = 0;
	  
	  
	while (((err > ERROR) && (itcnt < MAXITCNT)) || (itcnt == 0))
		{
		vm = mv;
		t = 0.0;
		r = vector(0.0, -sight.height, -sight.offset);
		v = MULTIPLY(vm, vector(cos(elev)*cos(azim), sin(elev), cos(elev)*sin(azim)));

		j = 0;
		k = MAX(range.max, z.x);
		for (i = 0; i <= k; i++){
			if ((vm < MINV) || (r.y < MINY)) break;
			if ((i >= range.min) && (i <= range.max) && (i % range.inc == 0))
				ranges.push({
					time     : t;
					lead     : lead*t;
					velocity : vm;
					drop     : r.y;
					windage  : r.z;
					range    : r.x/DX;
					energy   : ENERGY(bullet.weight, vm);
					momentum : MOMENTUM(bullet.weight, vm);
				});

			dt  = 0.5*DX/v.x;
			tv  = SUBTRACT(v, w);
			vm  = LENGTH(tv);
			drg = eq*vm*bc_getdrag(bullet.bc, vm/mach);
			tv  = SUBTRACT(v, MULTIPLY(dt, SUBTRACT(MULTIPLY(drg, tv), g)));

			dt  = DX/tv.x;
			tv  = SUBTRACT(tv, w);
			vm  = LENGTH(tv);
			drg = eq*vm*bc_getdrag(bullet.bc, vm/mach);
			v   = SUBTRACT(v, MULTIPLY(dt, SUBTRACT(MULTIPLY(drg, tv), g)));

			dr  = vector(DX, v.y*dt, v.z*dt);
			r   = ADD(r, dr);
			vm  = LENGTH(v);
			t   = t + LENGTH(dr)/vm;

		/* Correct trajectory for elevation and azimuth... */
			if (fabs(r.x - z.x) < 0.5*DX)
			{
			  dy = r.y - z.y;
			  dz = r.z - z.z;
			  err = 0.0;
			  if (options & OPT_ELE)
			  {
			    err = err + fabs(dy);
			    elev = elev - dy/r.x;
			  }
			  if (options & OPT_AZIM)
			  {
			    err = err + fabs(dz);
			    azim = azim - dz/r.x;
			  }
			  if (err > ERROR) break;
			}
	    }
	    itcnt++;
	  }
	trajectory.elevation = elev;
	trajectory.azimuth = azim;
	return 0;
}
