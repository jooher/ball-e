#pragma once

#include <Wire.h>

class BasicI2C {
  public:

  byte adr;
  TwoWire& wire;

  BasicI2C(byte i2cAdr, TwoWire& i2cWire=Wire):
    adr(i2cAdr),
    wire(i2cWire)
  {}

  int reg(byte reg, byte value){
    wire.beginTransmission(adr);
      wire.write(reg);
      wire.write(value);
    return endTransmission(true); 
  }

  bool request(byte start, int count, byte buffer[]=NULL){
    wire.beginTransmission(adr);
      wire.write(start);  // Start register for accelerometer data
    endTransmission(false);
    wire.requestFrom(adr,count);
    if(wire.available()==count){
      if(buffer)
        wire.readBytes(buffer,count);
      return true;
    }else{
      Serial.println("I2C Error! Resetting bus...");
      wire.end();     // De-initialize the I2C driver
      delay(10);
      wire.begin();   // Re-initialize the hardware bus
      return false;
    }
  }

  int readLH(){
    return wire.read() | wire.read() << 8;
  }

  bool endTransmission(bool terminate){
    if(wire.endTransmission(terminate)){ // !0 means error, need to recover
      wire.end();
      delay(10);
      wire.begin();
      return false;
    }
    return true;
  }

};