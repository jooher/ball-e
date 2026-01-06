export const
	// poly = K => x => K.reduceRight( (a,k) => a*x+k ),
	poly = (kx,K,ky) => x => ky*K.reduceRight( (a,k) => a*x*kx+k ),

	ORIG = null, //poly([ 1.24871, 0.0988438, 0.00152907, -3.07031e-06, 4.21329e-07 ]), /* Vapor Pressure coefficients */
	//APRX = poly([ 0, 1.7e-1, -3e-3, 6.4e-5, 5.1e-7]),
	APRX = poly(.01,[ 0, 10, -8, 43, 55],1),
	bounds={a:0,b:100,d:1},
	
PLOT =`
0 0.61129
10 1.2281
20 2.3388
30 4.2455
40 7.3814
50 12.344
60 19.932
70 31.176
80 47.373
90 70.117
95 84.529
100 101.32`

;
