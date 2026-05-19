#define uart Serial1

struct rangefinder_data_t {
    char status[16];
    int distance_cm;
};

void trace(const char * title, const byte buffer[], int length) {
    Serial.printf("%s (%d bytes):", title, length);
    for (int i = 0; i < length; i++)
        Serial.printf(" %02X", buffer[i]);
    Serial.print(" // ");
    for (int i = 0; i < length; i++)
        Serial.print(buffer[i] > 0x1F ? (const char)buffer[i] : '*');
    Serial.println();
}