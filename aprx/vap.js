export const
	//poly = K => x => K.reduceRight( (a,k) => a*x+k ),
	poly = (kx,K,ky) => x => ky*K.reduceRight( (a,k) => a*x*kx+k ),
	PLOT = null,
	ORIG = poly(1,[ 1.24871, 0.0988438, 0.00152907, -3.07031e-06, 4.21329e-07 ],1), /* Vapor Pressure coefficients */
	APRX = poly(.01,[ 12, 100, 150, -31, 425],.1),
	//APRX = poly([ 1, 17e-2, -18e-4, 48e-6, 18e-8]),
	bounds={a:0,b:100,d:1}
	;
