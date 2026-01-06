const	/* atmospheric constants */
	STD	= {
		A: 0.0,	/* Standard Altitude    - m */
		Tc: 15,	/* Standard Temperature - °C */
		T: 288.15,	/* Standard Temperature - K */
		P: 1013.3,	/* Standard Pressure    - mbar */
		H: 0.0,	/* Standard Humidity    -  1 */
		D: 1.225,	/* Standard air density - kg/m3 */
		M: 340.3,	/* Sound Velocity       - m/s */
	},
	
	poly = (kx,K,ky) => x => ky*K.reduceRight( (a,k) => a*x*kx+k ),
	//VAP = poly([ 0, 1.7e-1, -3.0e-3, 6.4e-5, 5.1e-7])
	VAP = poly(.01,[ 0, 10, -8, 43, 55],10), /* Vapor Pressure, °C => mbar, good for 0-100 °C */
	
	kTPH2D	= (kT,P,H) => {
		
	}

;

// poly(.01,[ 12, 100, 150, -31, 425],.1),

export function Atmos({ m, C, mbar, pc, kgm3, ms }) {
	
	const
		A = m	 ?? STD.A,
		H = pc ?? STD.H,
		
		Tc = C ?? STD.Tc - A*0.0065, /* Temperature Gradient - K/m */
		T = Tc + 273.15, /* Absolute zero, K */
		kT = STD.T/T,
		
		P = mbar || STD.P - A*.1, // mbar/m, atmosphere pressure gradient
		Pv = Tc<0	? 0:H*VAP(Tc), // mbar, water vapor pressure
		
		kD = kgm3	? kgm3/STD.D : kT*(P-0.3783*Pv)/STD.P, /* water vapor is 38% less dense than air*/
		M = ms	?? Math.sqrt(T)*19.396; /* Sound Speed coefficient m/s */
		
	
	this.T = T;
	this.P = P;
	this.H = H;
	this.kD = kD;
	this.M = M;
	this.data = `P:${P.toFixed(0)} mbar Pv:${Pv.toFixed(0)} mbar\nkD:${kD.toFixed(4)} kT:${kT.toFixed(4)}\nM:${M.toFixed(2)} m/s`;
	
	console.log(this.data);
}

/*

F/ft => K=(5/9F) / (m=0,305ft) = (5/9)/0,305 => 
1 F/ft = 1.8215 K/m

inHg = 3386,4 Pa

1 fps = .305 m/s

*/