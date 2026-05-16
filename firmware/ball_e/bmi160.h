// datasheet at https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmi160-ds000.pdf
#include "BasicI2C.h"

#define BMI160_I2C 0x69


struct IMU_data_t{
  float ax, ay, az, gx, gy, gz;
};

bool check(byte result){
  if(!result)return true;
  Serial.printf("Transmission error: %d\n",result);
  return false;
}


class BMI160 : BasicI2C {

  public:

  float sensA;  // Sensitivity for ±2g in LSB/g (adjust based on your configuration)
  float sensG;  // Sensitivity for ±2g in LSB/g (adjust based on your configuration)

  BMI160(byte i2cAdr=0x69, TwoWire& i2cWire=Wire) : BasicI2C(i2cAdr,i2cWire){}

  bool init(){
    Serial.printf("BMI160 on %02x\n",adr);
    reg(0x7E,0xB6); //soft reset
    delay(100);
    reg(0x7E,0x11);
    return true;
  }

  bool begin() {
    return !reg(0x7E,0x11);
  }

  bool stop(){
    return true;
  }

  int x7E(byte cmd){
    return reg(0x7E,cmd);
  }

  bool calibrate(){
      delay(100);
      x7E(0x37);  // Start accelerometer offset calibration
      delay(1000);
  }

  void filter(byte downsampling=0xE6){// 1.110.0110 = 0xE0: Bits [6:4] = 0x6 (64 samples), Bit [7] = 1 (Enable Filtered Data for Output)
    reg(0x45,downsampling); // FIFO_DOWN
  }

  enum RANGE_A{
    G2 = 3,
    G4 = 5,
    G8 = 8,
    G16 = 12
  };

  bool accel(
    byte conf=0x85, // 1.000.0101 -> Enable Undersampling (bit 7), ODR = 12.5Hz (bits 0-3)
    RANGE_A range = RANGE_A::G2, // 2g
    float kA = 9.81/16384.0 // m/s2
  ){
    sensA = kA * (2<<(range>>2)); 
    return reg(0x40,conf) && reg(0x41,range); // ACC_CONF, ACC_RANGE
  }
 

  enum RANGE_G{
    DS2000 = 0,
    DS1000 = 1,
    DS500  = 2,
    DS250  = 3,
    DS125  = 4
  };

  bool gyro(
    byte conf=0x26, // 00.10.0110 -> BWP=Normal, ODR=25Hz;
    RANGE_G range = RANGE_G::DS2000, // 2000 deg/s
    float kG = .0381 // deg/s
  ){
    sensG = kG * (2>>(4-range));
    return reg(0x42,conf) && reg(0x43,range); // GYR_CONF, GYR_RANGE
  }

  bool read_ag(IMU_data_t& g) {
    if(!request(0x12, 12)) return false;
    g.ax = sensA * readLH();
    g.ay = sensA * readLH();
    g.az = sensA * readLH();
    g.gx = sensG * readLH();
    g.gy = sensG * readLH();
    g.gz = sensG * readLH();
    return true;    
  }

  bool read(byte* buf){
    return request(0x12, 12, buf);
  }

};









