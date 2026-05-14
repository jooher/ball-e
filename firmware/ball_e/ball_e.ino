#define VERSION "1"
#define VER_URL "https://raw.githubusercontent.com/jooher/ball-e/main/firmware/c3/ball_e.version"
#define BIN_URL "https://raw.githubusercontent.com/jooher/ball-e/main/firmware/c3/ball_e.ino.bin"

#include "arduino_secrets.h"

// pin configuration

#define SDA 5
#define SCL 6
#define ASK 9
#define LED 8
#define ENA 8

#define PRESSED 0 // button is to GND

// oled
#define OLED_RST 4
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32

// dlrf
#define uart Serial0
#define RX 20
#define TX 21


// sleep configuration
#define SLEEP_DELAY_MAX 2e3
#define SLEEP_DELAY_INC 10
#define SLEEP_AFTER_MS 15e3
#define DEEP_SLEEP_AFTER_MS 20e3
#define WIFI_TIMEOUT 10e3

#include <Wire.h>

#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include <Fonts/FreeSansBold9pt7b.h>

Adafruit_SSD1306 oled( SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST); //


#include <Adafruit_Sensor.h>
#include <Adafruit_AHTX0.h>
#include <Adafruit_BMP280.h>

Adafruit_AHTX0 aht;
Adafruit_BMP280 bmp;


#include "esp_wifi.h"
#include "esp_pm.h"


#include "bmi160.h"

BMI160 bmi(0x69);


#include "ble.h"
#include "OTA.h"

#define say Serial.println
#define sayf Serial.printf


#include "txrx.h"
#include "dlrf-c.h"
DLRF lrf;

//#include "JC02.h"
//JC02 rf;


void trace(const char * title, const byte buffer[], int length) {
  sayf("%s (%d bytes):", title, length);
  for (int i = 0; i < length; i++)
    sayf(" %02X", buffer[i]);
  say(" // ");
  for (int i = 0; i < length; i++)
    say(buffer[i] > 0x1F ? (const char)buffer[i] : '*');
  Serial.println();
}

bool
  ok_tph=false,
  ok_imu=false,
  ok_oled=false,
  ok_lrf=false;

int err = 0;

void fail(char* reason){
  sayf("FAIL: %s\n",reason);
  if(ok_oled)oled.println(reason); 
  err++;
}

bool prepare(){

  Serial.println("Prepare hardware");

  ok_oled = oled.begin(SSD1306_SWITCHCAPVCC, 0x3C, false, false);
  
  oled.setTextColor(WHITE);
  oled.setRotation(3);
  oled.clearDisplay();
  oled.setCursor(0,0);
  oled.printf("V:%s\n\n",VERSION);
  oled.display();

  ok_tph = aht.begin() && bmp.begin();
  ok_imu = bmi.init();//&&false
  ok_lrf  = lrf.init(ENA,RX,TX);

  delay(100);

  if(ok_imu){
    bmi.accel();
    bmi.gyro();    
  }else fail("imu");


  if(ok_tph){
    bmp.setSampling(
      Adafruit_BMP280::MODE_NORMAL,     // Operating Mode.
      Adafruit_BMP280::SAMPLING_X8,     // Temp. oversampling
      Adafruit_BMP280::SAMPLING_X16,    // Pressure oversampling
      Adafruit_BMP280::FILTER_X16,      // Filtering
      Adafruit_BMP280::STANDBY_MS_500   // Standby time
    );    
  }else fail("tph");

  delay(2000);

  if(!err)
    oled.println("OK...");

  oled.display();
  delay(2000);

  return true;
}

bool active = false;

bool start_sensors(){
  if(active)return false;
  say("start sensors");
  if(ok_imu)bmi.begin();
  if(ok_lrf)lrf.begin();
//BLE::begin("Ball-e");
//digitalWrite(ENA,HIGH);
  delay(20);
  active=true;
  return true;
}

bool pause_sensors(){
  if(!active)return false;
  say("pause sensors");
  //digitalWrite(ENA,LOW);
  active = false;
  return true; 
}

IMU_data_t m;
float pitch=0., roll=0., d=0.;

union{
  byte bytes[12];
  int16_t words[6];
  struct {
    int16_t ax,ay,az,gx,gy,gz;
  } axes;
} raw;

bool read_sensors(){
  if(!active)return false;
  if(ok_imu)bmi.read(raw.bytes);
  if(ok_lrf) d = 0.1f*lrf.data.distance_dm;
  return true;  
}
// atmosphere reads once, gyro in loop
sensors_event_t tt,hh;
float t,p,h;

bool read_atmosphere(){
  aht.getEvent(&hh, &tt);
  t = tt.temperature;
  h = hh.relative_humidity;
  p = bmp.readPressure()*.001;
  return true;
}

void setup(){

  Serial.begin(9600);
  Wire.begin(SDA, SCL);
  delay(100);

  pinMode(ASK,INPUT_PULLUP);
  pinMode(LED,OUTPUT);
  pinMode(ENA,OUTPUT);

  prepare();

  digitalWrite(LED,HIGH);

  oled.clearDisplay();
  oled.setCursor(0,0);
  
  if(ok_tph){
    read_atmosphere();
    oled.printf("v%s\n\n\nT,С\n%.1f\n\nP,kPa\n%.0f\n\nH\n%.1f",VERSION,t,p,h);
  }else oled.println("TPH?");
  
  // WiFi for OTA updates
  if(digitalRead(ASK)==PRESSED){
    say("Button pressed => checking for updates");
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
  }

  oled.display();
  
/*
  esp_pm_config_esp32c3_t pm_config = {
    .max_freq_mhz = 80,      // Снижаем частоту со 160 до 80 МГц
    .min_freq_mhz = 10,      // Минимальная частота в простое
    .light_sleep_enable = true // РАЗРЕШАЕМ АВТОМАТИЧЕСКИЙ СОН
  };
  esp_pm_configure(&pm_config);
*/

  say("Setup done\n");
  delay(2000);
}

void cross(int x0, int y0, int pitch, int roll){
  oled.drawLine(x0,y0,x0-pitch,y0,SSD1306_WHITE);
  oled.drawLine(x0,y0,x0,y0+roll,SSD1306_WHITE);
}

int startTime = millis();

struct data_t{
  int16_t header, status, t,p,h, d,pitch,roll;
};

union broadcast_t{
  char bytes[16];
  data_t data;
};

broadcast_t buf;
  //data_t():header(0xff),status(0){}

bool updateChecked = false;

int sleepState = 0, sleepDelay = 0, lastReleased = millis();

int c=0;

void loop() {

  delay(sleepDelay);

  if( digitalRead(ASK) == PRESSED ){

    if(sleepState){
      say("button on");
      start_sensors();
      sleepState = 0;
      sleepDelay = 200;
    }

    oled.clearDisplay();
    oled.setCursor(0,0);
    //oled.println(++c);

    read_sensors();

    if(ok_imu){
      cross(16,100,raw.axes.ax>>6,raw.axes.ay>>8);
    }else oled.println("imu?\n");

    if(ok_lrf){
      if(d<1000){
        oled.setCursor(0,68);
        oled.setFont(&FreeSansBold9pt7b);
      }else{
        oled.setCursor(0,60);
        oled.setFont();
      }
      oled.printf(d<10 ? "%.1f" : "%.0f",d);
    }else oled.println("lrf?\n");

    oled.display();      

/*
    if(BLE::started){
      memcpy(&broadcast[2], (char*)(rf.response+3), 8);
      ++broadcast[10];
      BLE::advertise(broadcast,12);      
    }
*/
  }else{ // button not pressed

    int time = millis()-lastReleased;

    switch(sleepState){

      case 0: // no sleep, actively working
        say("button off");
        sleepState=1; // pause
        lastReleased = millis();
        break;

      case 1: // paused
        if(time > SLEEP_AFTER_MS){
          say("go to sleep");
          sleepState = 2; // go to light sleep
          pause_sensors();
          oled.clearDisplay();
          oled.display();
        //BLE::passivate();
          sleepDelay = 100;
        }
        break;

      case 2: // light sleep display turned off
	      if(time > DEEP_SLEEP_AFTER_MS){
          say("go to deep sleep");
          sleepState = 3;
          //go to deeper sleep
        }else
        if(sleepDelay < SLEEP_DELAY_MAX)
          sleepDelay += SLEEP_DELAY_INC;
        break;

      default:
        //say("zzz....");
        break;
    }

  }
  
  if(!updateChecked){

    if(WiFi.isConnected()){
      say("WiFi connected");
      digitalWrite(LED,LOW);
      OTA::check(VERSION,VER_URL,BIN_URL); 
      digitalWrite(LED,HIGH);
      WiFi.disconnect(true);    
      updateChecked = true;        
    }

    if(millis()-startTime > WIFI_TIMEOUT){
      say("Can't update from here");      
      updateChecked = true;        
    }

    if(updateChecked){
      WiFi.mode(WIFI_OFF);
      say("WiFi off");
    }
  }
  
}