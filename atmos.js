const	/* atmospheric constants */
	STD	= {
		T: 59.0,	/* Standard Temperature - °F */
		P: 29.92,	/* Standard Pressure    - in Hg */
		H: 0.0,	/* Standard Humidity    -  % */
		D: 0.076474,/* Standard air density - lbs/ft^3 */
		M: 1116.450,/* Sound Velocity       - ft/s */
		A: 0.0   /* Standard Altitude    - feet */
	}
	
	,VAP = [ 1.24871, 0.0988438, 0.00152907, -3.07031e-06, 4.21329e-07 ] /* Vapor Pressure coefficients */
	
	,T0             459.67       /* Freezing Point       - °R */
	,TSTDABS        518.67       /* Standard Temperature - °R */
	,TEMPGRAD       -3.56616e-03 /* Temperature Gradient - °F/ft */
	,ETCONV         3.342e-04
	
	,PRESSEXPNT     -5.255876    /* Pressure Exponent    - none */
	,VV1            49.0223      /* Sound Speed coefficient */

;

const

poly = (x,K) => K.reduceRight( (v,k)=>v*x+k );

/* Adjust the passed ATMOS's density and mach number for temperature, pressure and humdity.  */

void atmos_atmos(a)
{
	const
		T = a.T,
		hc = (T <= 0) ? 1.0 : (a.P - 0.3783*(ETCONV * poly(T,VAP) * a.H))/STD.P

	a.D = STD.D * (TSTDABS/(T + T0))*hc;
	a.M = sqrt(T + T0)*VV1;

};

/* set the ICAO Standard Conditions for the current altitude */
void atmos_standardalt(a)
{
	const T = TSTDABS + a.A*TEMPGRAD;
	a.P = STD.P * Math.pow( TSTDABS/T, PRESSEXPNT );
	a.T = T - T0; /* line above need absolute! */
	a.H = STD.H;
	atmos_atmos(atmos);
}


/* 
  double temperature;   // temperature in °F 
  double pressure;      // pressure in in Hg    
  double humidity;      // relative humdity     
  double density;       // atmospheric density  
  double mach;          // mach 1.0 in feet/sec 
  double altitude;      // altitude in feet     
 */

function Atmos({ F, inHg, pc, lbft3, fts, ft }) {
	this.T = F;
	this.P = inHg;
	this.H = pc;
	
	this.D = 
}
