import dragModels from './G-funcs.js';
 
export function Bullet({ G="G7", bc=1, weight, caliber, vm }){
	this.drag = ( (k,drag) => M => k * drag(M) )( .3048/bc, dragModels[G] || dragModels.G7 ); // fps => m/s
	this.weight = weight;
	this.caliber = caliber;
	this.vm = vm;
}