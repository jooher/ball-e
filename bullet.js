import dragModels from './G-funcs.js';

const poly = K => x => K.reduceRight( (a,k) => a*x+k );
 
export function Bullet({ G="G7", bc=1, weight, caliber, vm, drift }){
	this.drag = ( (k,drag) => M => k * drag(M) )( .3048/bc, dragModels[G] || dragModels.G7 ); // fps => m/s
	this.drift = (p => m => p(m/1000)/100 /* convert cm/km to meters */ )(poly([0,0,drift*.25,0,drift*.75])); 
	this.weight = weight;
	this.caliber = caliber;
	this.vm = vm;
}