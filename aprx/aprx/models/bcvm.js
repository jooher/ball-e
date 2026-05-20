const

poly = K => v => K.reduce( (a,k) => a*v+k ),

Kbc = poly([200,90,20,5,1.25]),
Kvm = poly([300,10,20,14,4,.9]),
Kbcvm = x => 0,

O = .4,

model = ( bc=.25, vm=.800 ) => {
	bc = 0.4 - bc;
	vm = 1.0 - vm;
	return O + Kbc(bc)*Kvm(vm) + Kbcvm(bc*vm);
}
;

export default model;