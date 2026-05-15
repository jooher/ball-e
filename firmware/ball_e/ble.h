#include <NimBLEDevice.h>

NimBLEAdvertising *pAdvertising;

uint8_t myDataBuffer[4] = {0, 0, 0, 0};
uint8_t seqCounter = 0;

void updateLivePayload() {
  std::string payload("");
  payload += (char)5;    // Total block length (1 byte flag + 4 bytes data)
  payload += (char)0xFF; // BLE Flag: Manufacturer Specific Data
  
  for(int i = 0; i < 4; i++) {
    payload += (char)myDataBuffer[i];
  }

  // 3. Push data straight to active radio RAM
  NimBLEAdvertisementData oAdvData;
  oAdvData.addData(payload);
  pAdvertising->setAdvertisementData(oAdvData);
}

void setup() {
  NimBLEDevice::init("C3_Broadcaster");
  pAdvertising = NimBLEDevice::getAdvertising();
 pAdvertising->setMinInterval(160);
  pAdvertising->setMaxInterval(160);
  
  // Load initial data and start broadcasting
  updateLivePayload();
  pAdvertising->start();
  Serial.println("BLE Advertising Started.");
}

void loop() {
      pAdvertising->stop();
    } else {
      pAdvertising->start();
    }
  }
}





class BLE {

  public:

  static char* name;
  static NimBLEAdvertising *pAdvertising;
  static bool started;

//  static BLEAdvertisementData advertisementData;

  static bool begin(char* name) {
    if(!started){
      BLEDevice::init(name);
      pAdvertising = BLEDevice::getAdvertising();
      Serial.printf("Starting BLE as %s\n",name);
      BLE::name=name;
      pAdvertising->setMinInterval(320);
      pAdvertising->setMaxInterval(640);
    }
      return;
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
      pAdvertising->setMinInterval(320);
    return pAdvertising->start();
  }

  static bool passivate(){
    pAdvertising->stop();
  }

};



bool BLE::started = false;

BLEAdvertising * BLE::pAdvertising = nullptr; //BLEDevice::getAdvertising();
BLEUUID BLE::uuid(0xa6ad5352, 0x0cc0, 0x48fb, 0x986c6a12bba5);
char* BLE::name = nullptr;
