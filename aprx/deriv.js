export const

poly = K => x => K.reduceRight( (a,k) => a*x+k ),

APRX = poly([ 0, 0, 15, 0, 47]),
ORIG = null,
	
PLOT =`
0.0 0
0.2 1
0.4 4
0.6 12
0.8 29
1.0 62
1.2 120
`,

bounds={a:0,b:1.2,d:.1,h:120};
