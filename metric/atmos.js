const	/* atmospheric constants */
	STD	= {
		A: 0.0,   /* Standard Altitude    - m */
		T: 15,	/* Standard Temperature - °C */
		Ta: 288.15,	/* Standard Temperature - K */
		P: 1.013,	/* Standard Pressure    - bar */
		H: 0.0,	/* Standard Humidity    -  % */
		D: 1.225,	/* Standard air density - kg/m3 */
		M: 340.3,	/* Sound Velocity       - m/s */
	}
	,poly = K => x => K.reduceRight( (a,k) => a*x+k )
	,VAP = poly([ 1.24871, 0.0988438, 0.00152907, -3.07031e-06, 4.21329e-07 ]) /* Vapor Pressure coefficients */
;

export function Atmos({ ft, F, inHg, pc, lbft3, fps }) {
	
	const
		A = m		?? STD.A,
		T = C		?? STD.T - A*0.0064957 /* Temperature Gradient - K/m */, Ta = T + 273.15 /* Absolute zero °R */, kT = STD.Ta/Ta,
		P = b		?? STD.P * Math.pow( kT, -5.255876 ), /* Pressure Exponent */
		H = pc	?? STD.H,
		
		kD = kgm3	? kgm3/STD.D : kT * ( Ta < 250 ? 1.0 : (P - ( 0.04286e-6 * H * VAP(T) ))/STD.P ), /*ETCONV = 0.3783*3.342e-04*/
		M = fps	?? Math.sqrt(Ta)*19.396; /* Sound Speed coefficient m/s */
	
	this.T = T;
	this.P = P;
	this.H = H;
	this.kD = kD;
	this.M = M;
}

/*

F/ft => K=(5/9F) / (m=0,305ft) = (5/9)/0,305 => 
1 F/ft = 1.8215 K/m

inHg => 0,0339 bar

1 fps = .305 m/s

*/