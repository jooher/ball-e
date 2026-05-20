#include <Wire.h>

#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include <Fonts/FreeMonoBold12pt7b.h>

#include <Adafruit_Sensor.h>
#include <Adafruit_AHTX0.h>
#include <Adafruit_BMP280.h>
#include <DFRobot_BMI160.h>
//#include <Adafruit_MPU6050.h>

#include "txrx.h"

#define say Serial.println
#define sayf Serial.printf

#define LED 8

#define SDA 6
#define SCL 5
#define OLED_RST 8
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32

Adafruit_SSD1306 oled( SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST); //
Adafruit_MPU6050 mpu;
Adafruit_AHTX0 aht;
Adafruit_BMP280 bmp;


//#include "dlrf-c.h"
//DLRF rf;

#include "JC02.h"
JC02 rf;

int err = 0;

void fail(char* reason){
  say(reason);
  err++;
}


// atmosphere reads once, gyro in loop
sensors_event_t tt,hh,aa,gg;
float t,p,h,d;

void read_atmosphere(){
  p = bmp.readPressure()*.001;
  aht.getEvent(&hh, &tt);
  t = tt.temperature;
  h = hh.relative_humidity;
 }


void _setup(){
  Serial.begin(9600);
  pinMode(LED,OUTPUT);
  delay(100);
  Serial.println("Hi");
}

void _loop(){
  digitalWrite(LED,LOW);
  delay(100);
  digitalWrite(LED,HIGH);
  delay(900);
  Serial.print(".");
}




void setup()
{
  
  Serial.begin(9600);  
  Wire.begin(SDA, SCL); 
  
  delay(100);
  //
/*
  //oled reset
  pinMode(OLED_RST, OUTPUT);
  digitalWrite(OLED_RST, LOW);
  delay(20);
  digitalWrite(OLED_RST, HIGH);
*/
  
  
  if(!mpu.begin()) fail("MPU fail");
  if(!aht.begin()) fail("AHT fail");
  if(!bmp.begin()) fail("BMP ok");
  else bmp.setSampling(
      Adafruit_BMP280::MODE_NORMAL,     // Operating Mode.
      Adafruit_BMP280::SAMPLING_X2,     // Temp. oversampling
      Adafruit_BMP280::SAMPLING_X16,    // Pressure oversampling
      Adafruit_BMP280::FILTER_X16,      // Filtering
      Adafruit_BMP280::STANDBY_MS_500   // Standby time
    );
  
/*  
*/
  if(!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C, false, false)) fail("OLED fail");
  
  delay(100);

  oled.setTextColor(WHITE);
  oled.setRotation(3);
  oled.clearDisplay();
  oled.println("Hi");
    
  read_atmosphere();
  oled.printf("T%.1f\nP%.1f\nH%.1f\n\n~%d",t,p,h,err);

  oled.display();

  //if(!rf.begin(13,15,25)) fail("RF fail");
  
  delay(5000);
    
  say("Setup finished"); 
}


int c=0;


// fx

void printxyz(sensors_vec_t& a){
  oled.printf("X=%.2f\nY=%.2f\nZ=%.2f\n",a.x,a.y,a.z);
}

void tripod(int x, int y, float k, sensors_vec_t& o){
  
  int
    u = k*o.x,
    v = x-k*o.y,
    w = y+k*o.z;
  
  oled.drawLine(x,y,x,w,WHITE);
  oled.drawLine(x,y,v,y,WHITE);
  oled.drawCircle(x,y,u,WHITE);

}

void loop() {
  
  delay(100);
  //Serial.print(":");
  //rf.read();

  d = 0.01f*rf.data.distance_cm;
 
  oled.clearDisplay();
  oled.setCursor(0,0);

  //oled.print(c++);

  //oled.setFont(&FreeMonoBold12pt7b);
  if(d>.1f)    
    oled.printf("%.1f m\n", d);
  else
    oled.println("-.-");
  
  mpu.getEvent(&aa, &gg, &tt);
  tripod(16,40,1.f,aa.acceleration);
  tripod(16,80,1.f,gg.gyro);
   
/**/
  oled.display();
}

void sleep(int ms){
  esp_sleep_enable_timer_wakeup(ms*1e3);
  esp_light_sleep_start();
}