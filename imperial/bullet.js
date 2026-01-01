import dragModels from '../G-funcs.js';
 
export function Bullet({ G="G7", bc=1, weight, caliber, vm }){
	//const factor = weight / 7000 / (caliber * caliber) / bc ; // (grain/grain/pound) / inch*inch / 1
	
	this.drag = ( (k,drag) => M => k * drag(M) )( 1/bc, dragModels[G] || dragModels.G7 );
	this.weight = weight;
	this.caliber = caliber;
	this.vm = vm;
}