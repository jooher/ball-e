const	/* atmospheric constants */
	STD	= {
		A: 0,   /* Standard Altitude    - m */
		T: 59.0,	/* Standard Temperature - °F */
		Ta: 518.67,	/* Standard Temperature - °R */
		P: 29.92,	/* Standard Pressure    - inHg */
		H: 0.0,	/* Standard Humidity    -  % */
		D: 0.076474,/* Standard air density - lbs/ft^3 */
		M: 1116.45,	/* Sound Velocity       - ft/s */
	}
	,poly = K => x => K.reduceRight( (a,k) => a*x+k )
	,VAP = poly([ 1.24871, 0.0988438, 0.00152907, -3.07031e-06, 4.21329e-07 ]) /* Vapor Pressure coefficients */
;

export function Atmos({ ft, F, inHg, pc, lbft3, fps }) {
	
	const
		A = ft	?? STD.A,
		T = F		?? STD.T - A*3.56616e-03 /* Temperature Gradient - F/ft */, Ta = T + 459.67 /* Absolute zero °F */, kT = STD.Ta/Ta,
		P = inHg	?? STD.P * Math.pow( kT, -5.255876 ), /* Pressure Exponent */
		H = pc	?? STD.H,
		
		kD = lbft3	? lbft3/STD.D : kT * ( Ta < 0 ? 1.0 : (P - ( 1.2643e-4 * H * VAP(T) ))/STD.P ), /*ETCONV = 0.3783*3.342e-04*/
		M = fps	?? Math.sqrt(Ta)*49.0223; /* Sound Speed coefficient ft/s */
	
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