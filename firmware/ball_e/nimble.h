#include <NimBLEDevice.h>

class BLE {
  
  static const char* name; 

  public:

  static bool init(const char* deviceName, int timing) {
    name = deviceName;
    if(!BLEDevice::init(name)) return false;
    Serial.printf("BLE %s init as %s\n", BLEDevice::getAddress().toString().c_str(), name); //
    interval(timing);
    return true;
  }

  static bool interval(int slots){
    Serial.printf("BLE interval: %d\n", slots);
    BLEAdvertising* pA = BLEDevice::getAdvertising();
    if(pA->isAdvertising())pA->stop();
    pA->setMinInterval(slots); 
    pA->setMaxInterval(slots);
    pA->start();
    return true;
  }

  static bool start(){
    Serial.println("BLE start");
    return BLEDevice::startAdvertising(); //pAdvertising && pAdvertising->start();
  }

  static bool stop(){
    Serial.println("BLE stop");
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