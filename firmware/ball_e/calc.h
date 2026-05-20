#define halfG = 9.81/2
#typedef float[5] float5

Preferences storage;

float poly(float x, float[] K, int i){
  float y = 0;
  while(i)
    y = y*x + K[--i];
  return y;
}

bool load(char* namespace, char* key, void* buffer, size_t len){
  storage.begin(namespace,true);
  bool ok = len==storage.getBytesLength(key);
  if(ok)storage.getBytes(key, (uint8_t*)buffer, len);
  storage.end();
  return ok;
}

enum BallisticModel{
  G3:3;
  G7:7;
};

struct K_t {
  float5 bc,vm,r,sd
};

struct Bullet{
  float bc;
  float vm;
  float sd;
};

struct clicks_t{
  float U;
  float R;
};


float AirDensity(float T, float P, float H){
  return 1.0;
}

class Calc{

  K_t K;
  Bullet bullet;

  float bcvm;
  float kD=1.0;

  Calc(char* bulletKey, float air_density=1f):kD(air_density){
    if(
      load("bullet", bulletKey, &bullet, sizeof(Bullet)) &&
      load("model", String((int)bullet.m).c_str(), &K, sizeof(K_t) )
    )bcvm = 
      poly( 0.4f - bullet.bc, K.bc,5 ) *
      poly( 1.0f - .001*bullet.vm, K.vm,5 ); // m/s => km/s

    else Serial.printf("No data for %s", bulletKey);
  }

  bool calculate( clicks_t &result, float R, float LOS){ //float T, float P, float H

    float
      r = .001*R; // m => km
      
    float
      bcvmr = bullet.bcvm*poly(r,K.r,5)/R, // angle 
      para = LOS - R*halfG/(B.vm*B.vm), //  = sinLOS - t*t*halfG/R // angle
      drop = para + bcvmr,
      drift = bullet.drift*poly(r,K.sd,5)
      
    result.U = drop;
    result.R = 0;
    
    return true;
  }

}







/*
float[] Kbc = {200f,90f,20f,5f,1.25f},
float[] Kvm = {300f,10f,20f,14f,4f,.9f},
float[] Kr = {0,0,0,0,1},
float[] Ksd = {0,0,.25,0,.75}; // spin drift
*/

//Kbcvm = x => 0,


bool load(){

}


