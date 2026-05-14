#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEAdvertising.h>

class BLE {

  public:

  static char* name;
  static BLEAdvertising *pAdvertising;
  static BLEUUID uuid; //(0xa6ad5352, 0x0cc0, 0x48fb, 0x986c6a12bba5);
  static bool started;

//  static BLEAdvertisementData advertisementData;

  static void begin(char* name) {
    if(started)
      return;
    BLEDevice::init(name);
    pAdvertising = BLEDevice::getAdvertising();
    Serial.printf("Starting BLE as %s\n",name);
    BLE::name=name;
    //pAdvertising->setMinInterval(200);
    started = true;
  }

  static bool advertise(char* data, int len) {
    if(!started)return false;
    pAdvertising->stop();
      BLEAdvertisementData advertisementData;     //
      advertisementData.setName(BLE::name);
      advertisementData.setManufacturerData(String(data, len));//
      //advertisementData.addData(data, len);
      pAdvertising->setAdvertisementData(advertisementData);
      pAdvertising->setMaxInterval(640);
      pAdvertising->setMinInterval(320);
    return pAdvertising->start();
  }

  static bool passivate(){
    pAdvertising->stop();
    //pAdvertising->setMaxInterval(72000);
    //pAdvertising->setMinInterval(36000);
    return pAdvertising->start();
  }

};



bool BLE::started = false;

BLEAdvertising * BLE::pAdvertising = nullptr; //BLEDevice::getAdvertising();
BLEUUID BLE::uuid(0xa6ad5352, 0x0cc0, 0x48fb, 0x986c6a12bba5);
char* BLE::name = nullptr;
