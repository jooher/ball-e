static const byte DLRF_standby[] = { 0x55, 0x00, 0x02, 0x00, 0x00, 0x57 };
static const byte DLRF_single[] = { 0x55, 0x01, 0x02, 0x20, 0x00, 0x76 };
static const byte DLRF_continuous[] = { 0x55, 0x02, 0x02, 0x20, 0x00, 0x75 };
static const byte DLRF_selftest[] = { 0x55, 0x03, 0x02, 0x00, 0x00, 0x54 };

class DLRF final {

  public:

  rangefinder_data_t data;
  int last;

  int EN=-1;

  bool init(int En, int Rx, int Tx, bool enabled=false, int baud=115200) {

    pinMode(Rx,INPUT);
    pinMode(Tx,OUTPUT);
    if(En>0)pinMode(EN=En, OUTPUT);

    uart.begin(baud, SERIAL_8N1, Rx, Tx);
    last = millis() + 1000;
    enable(enabled);
    Serial.println("DLRF init ok");
    return true; //false; //
  }

  bool begin(){
    enable(true);
    return true;
  }

  void enable(bool enabled=true){
    digitalWrite(EN, enabled ? HIGH : LOW);
  }

  int wrd(int n) {
      int v = (int)word(response[n + n + 1], response[n + n + 2]);
      //Serial.printf("Value at %d is %d\n",n,v);
      return v;
  }

  void sendCommand(const byte* cmd, int length = 6) {
      //trace("\nCommand ", cmd, length);
      uart.write(cmd, length);
      last = millis();
  }

  byte response[16];
  int ix = 0, len=0;

//          O        D        D     V  T  C
//55 01 0A 20 00 00 20 00 00 00 00 A0 2C D2 55 01


  bool read() {

      if (uart.available()) {
          while (uart.available()) {
            
              byte c = uart.read();
            
              if( ix || c==0x55 ){
                
                if(ix==2) {
                  len=(int)c+2;
                }
                
                response[ix++]=c;
                
                if(!--len){
                  parse();
                  ix=0;
                  len=0;
                }

              }
          }
          last = millis();
      }
      
      else if (millis() - last > 500){
        sendCommand(DLRF_single);
      }
      return false;
  }

  byte xorcheck(){
    byte x=0;
    for(int i=0; i<ix; i++)
      x^=response[i];
    return x;
  }

  bool parse() {

    //trace("DLRF: ",response,16);

    if (xorcheck()){
      Serial.printf(" !! XOR=%X", xorcheck() );
      return false;
    }

    int d;

     switch(response[1]){
      case 1:
      case 2:
          data.distance_dm = response[6] | (response[5] | response[4]<<8) << 8;
          //Serial.printf("Distance: %X %X %0X %d %d", response[8],response[7],response[6], d, data.distance_cm);
          snprintf(data.status,16,"T:%.2f V:%.1f", .1f*response[11], .1f*response[12]);
          break;
      case 0: // standby ok
      case 3: // self diagnosis
      case 7: // voltage
      default: break;
    }

    return true;
  }

};