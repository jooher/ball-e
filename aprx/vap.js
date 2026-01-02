export const
	poly = K => x => K.reduceRight( (a,k) => a*x+k ),
	ORIG = poly([ 1.24871, 0.0988438, 0.00152907, -3.07031e-06, 4.21329e-07 ]), /* Vapor Pressure coefficients */
	APRX = poly([ 1, .1, 15e-4, -31e-7, 42e-8]),
	//APRX = poly([ 1, 17e-2, -18e-4, 48e-6, 18e-8]),
	bounds={a:0,b:100,d:1}
	;
