#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

class gattCallbacks : public BLECharacteristicCallbacks {

    void onWrite(BLECharacteristic* pCharacteristic) {

        const uint8_t* rawData = pCharacteristic->getValue().data();
        size_t dataLength = pCharacteristic->getValue().length();

        if (dataLength > 0) {
            Preferences preferences;
            preferences.begin("storage", false); // Open namespace in read/write mode

            // 2. Store the raw binary chunk under the key "bin_data"
            preferences.putBytes("bin_data", rawData, dataLength);
            preferences.end(); 

            Serial.printf("Saved %d bytes of binary data to NVM!\n", dataLength);
        }
    }
};

void gatt_start() {

  BLEServer* pServer = BLEDevice::createServer();
  BLEService* pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic* pCharacteristic = pService->createCharacteristic( CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE );
  pCharacteristic->setValue("Hello Phone!");
  pCharacteristic->setCallbacks(new gattCallbacks());
  pService->start();

  // 7. Configure advertising so phones can see the service UUID
  NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID); // Critical: Lets phones find your service
  
  pAdvertising->start();
}
