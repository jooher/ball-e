#include <NimBLEDevice.h>

class BLE {
  
    static const char* name; 
    static NimBLEAdvertisementData packet; 
    static NimBLEAdvertising *pAdvertising;

  public:

  static bool init(const char* deviceName, int timing) {
    name = deviceName;
    if(!NimBLEDevice::init(name))return false;
    Serial.printf("BLE %s init as %s\n", NimBLEDevice::getAddress().toString().c_str(), name); // 
    pAdvertising = NimBLEDevice::getAdvertising();
    pAdvertising->setMinInterval(timing); 
    pAdvertising->setMaxInterval(timing);
    pAdvertising->setName(name);
    return true;
  }

  static bool start(){
    return pAdvertising && pAdvertising->start();
  }

  static bool stop(){
    return pAdvertising && pAdvertising->stop();
  }
  
  static bool update(uint8_t* data, int size){
    if(!pAdvertising)return false;
    pAdvertising->clearData();
    packet.setName(name);
    packet.setManufacturerData(data, size);
    pAdvertising->setAdvertisementData(packet);
    return true;
  }


};

const char* BLE::name = nullptr;
NimBLEAdvertisementData BLE::packet;
NimBLEAdvertising* BLE::pAdvertising = nullptr;
