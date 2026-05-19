#define say Serial.println
#define sayf Serial.printf

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_AHTX0.h>
#include <Adafruit_BMP280.h>

#include <BMI160_RT.h> // Надежная библиотека
BMI160_RT bmi;

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET    8
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

Adafruit_AHTX0 aht;
Adafruit_BMP280 bmp;

int err = 0;

void fail(char* reason){
  say(reason);
  err++;
}

void setup() {
  
  Serial.begin(9600);
  Wire.begin(6, 5);

  delay(100);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C, false,false)) fail("OLED fail");
  else{
    display.clearDisplay();
    //display.setRotation(3); // Вертикально
    //display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println("Hi");
  }
  aht.begin();
  bmp.begin();//0x76
  Serial.println("aht & bmp ok, trying bmi");
  // Инициализация BMI160
  if (bmi160.begin(BMI160_I2C_ADDR_68))Serial.println("bmi ok");
/*
  BMI160.setAccelerometerRange(2); // +/- 2g
  BMI160.setGyroRange(250);        // 250 degrees/sec
*/
  // Датчики окружения

  Serial.println("setup ok");
}

void loop() {
  
  int16_t ax, ay, az, gx, gy, gz;
  bmi160.getAccelAdc(&ax, &ay, &az);
  bmi160.getGyroAdc(&gx, &gy, &gz);
  
  // Читаем AHT20
  sensors_event_t humidity, temp_aht;
  aht.getEvent(&humidity, &temp_aht);

  display.clearDisplay();
  display.setCursor(0, 0);

  // Вывод данных
  display.printf("A:%.2f, G:%.2f\n",ax/16384.0, gx/131.0);  
  display.printf("T:%.1f, P:%.1f", temp_aht.temperature, bmp.readPressure());
  
  display.display();
  delay(500);

  Serial.print(".");
}
