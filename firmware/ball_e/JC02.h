static const byte JC02_reset[] = {0xAE,0xA7,0x05,0x00,0x0B,0x00,0x10,0xBC,0xBE};
static const byte JC02_single[] = {0xAE,0xA7,0x04,0x00,0x05,0x09,0xBC,0xBE};
static const byte JC02_start[] = {0xAE,0xA7,0x04,0x00,0x0E,0x12,0xBC,0xBE};
static const byte JC02_stop[] = {0xAE,0xA7,0x04,0x00,0x0F,0x13,0xBC,0xBE};

class JC02 final {

    public:

    rangefinder_data_t data;
    int period;
    int last;

    bool begin(int EN, int Rx, int Tx, int baud=9600 ) {
        pinMode(EN, OUTPUT);
        digitalWrite(EN, HIGH);
        uart.begin(baud, SERIAL_8N1, Rx, Tx);
        period = 1000;
        last = millis();
        return true;
    }

    void setPeriod(int ms){
      period = ms;
    }

    int wrd(int n) {
        int v = (int)word(response[n + n + 1], response[n + n + 2]);
        //Serial.printf("Value at %d is %d\n",n,v);
        return v;
    }

    void sendCommand(const byte* cmd, int length = 8) {
        //trace("\nCommand ", cmd, length);
        uart.write(cmd, length);
        last = millis();
    }

    /*

    https://aliexpress.ru/item/1005010430761656.html

    AEA7 ... BCBE

    05 00 0B 00 10 - reset

    04 00 05 09 - single measurement
    response:

    04 00 0E 12 - continous measurement
    04 00 0F 13 - stop continuous measurement

    response:
    04 00 8B 8F : OK reset
    04 00 8E 92 : OK continuous
    04 00 8F 93 : OK stop continuous
    04 00 0E 12 : FAIL
    17 00 85 <19bytes> <checksum>; 19bytes = elevation, crowfly distance, sine height, horizon range,  two-point high, azimuth, horizontal angle, span, velocity, parasang(1byte)

     */

    byte response[80];
    int ix = 0;
  

    int read() {
          
        while (uart.available()) {

            byte c = uart.read();

            if (c == 0xBE && response[ix - 1] == 0xBC) parse();

            if (c == 0xA7 && response[ix - 1] == 0xAE)
                ix = 0;
            else
                response[ix++] = c;
          
            if (ix > 64) { //sizeof(response)
                trace("JC buffer overflow", response, ix);
                ix = 0;
            }
        }

      if(millis()-last > period)
        sendCommand(JC02_single);

      return data.distance_cm;
      
    }

    bool parse() {
        bool ok = true; //response[0]==ix; // && endswith 0xBCBE && checksum blabla....
        if (ok) {
            //trace("BCBE: ",response,ix);
            if (response[2] == 0x0E)
                data.distance_cm = 0; //Serial.println("JC02 Fail");
            if (response[2] == 0x85)
                data.distance_cm = wrd(2)*10;
        } else
            trace("JC02 rubbish: ", response, ix);
        return ok;
    }

};