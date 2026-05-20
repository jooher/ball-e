const

g2 = 9.8/2,

k = [
	[0,0,0], //vm
	[0,0,0], //bc
	[0,0,0], //kd
	[0,0,0] //m
]

str2mtx = txt.trim.split(/\n/g).map(str=>str.split(/\s/g).map(s=>parseFloat(s))),
ttm = (vm,bc,kd) => 1,

corrected = (vm,sin,A /* vm,bc,kd,m */) => {
	// // tm = (vm-m)/ttm(vm,bc,kd), // time to M, assume vm>M
	const 
		para = x => x*(sin - g2*x/vm), // x=t*vm, t=x/vm
		drop = x => A.map( a => poly(x,a) ).reduce((a,b)=>a+b);
		
	return x => para(vm,sin,x) - drop(x);
}



/*
@1000m

for(let t=-20; t)
for(let bc=.2; bc<=.5; bc+=.1)
for(let vm=600; vm<1200; vm+=100){
	
}
*/