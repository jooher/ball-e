struct {
  float U;
  float R;
} calc;

struct bullet{
  float bc;
  float vm;
}

float poly(float x, float[] K, int i){
  float y = 0;
  while(i)
    y = y*x + K[--i];
  return y;
}

float Kbc = {200f,90f,20f,5f,1.25f},
float Kvm = {300f,10f,20f,14f,4f,.9f},
//Kbcvm = x => 0,

void adjust(float R, bullet B, float T, float P, float H){
  float bc = 0.4f - B.bc;
  float vm = 1.0f - B.vm;
  float bcvm = poly(bc,Kbc,5)*poly(vm,Kvm,5);

  calc.U = 
}


	bc = ;
	vm = 1.0 - vm;
	return O + Kbc(bc)*Kvm(vm) + Kbcvm(bc*vm);
