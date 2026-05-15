#include <NimBLEDevice.h>

class BLE {
  
  static const char* name; 

  public:

  static bool init(const char* deviceName, int timing) {
    name = deviceName;
    if(!BLEDevice::init(name)) return false;
    Serial.printf("BLE %s init as %s\n", BLEDevice::getAddress().toString().c_str(), name); // 
    BLEAdvertising* pA = BLEDevice::getAdvertising();
    pA->setMinInterval(timing); 
    pA->setMaxInterval(timing);
    return true;
  }

  static bool start(){
    return BLEDevice::startAdvertising(); //pAdvertising && pAdvertising->start();
  }

  static bool stop(){
    return BLEDevice::stopAdvertising(); //pAdvertising && pAdvertising->stop();
  }
  
  static bool update(uint8_t* data, int size){
    BLEAdvertising* pA = NimBLEDevice::getAdvertising();
    pA->clearData();
    BLEAdvertisementData ad = pA->getAdvertisementData();
    ad.setName(name);
    ad.setManufacturerData(data,size);
    pA->setAdvertisementData(ad);
    pA->refreshAdvertisingData();
    return true;
  }


};

const char* BLE::name = nullptr;