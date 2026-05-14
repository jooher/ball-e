#include <WiFi.h>
#include <HTTPClient.h>
#include <Update.h>

#define S Serial.printf

class OTA {

  public:
  
  static bool updated;

  static bool check(const char* currentVersion, const char* versionUrl, const char* firmwareUrl){

    if(OTA::updated || (WiFi.status() != WL_CONNECTED) ) return OTA::updated;

    S("OTA Connected to %s, checking for updates...\n", WiFi.SSID());// ip[0],ip[1],ip[2],ip[3]

    HTTPClient http;
    int httpCode;
    
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    
    String latestVersion = "";
    http.begin(versionUrl);
      httpCode = http.GET();
      if (httpCode != HTTP_CODE_OK) return S("Failed to check updated version: %d\n", httpCode) && false;
      latestVersion = http.getString();
      latestVersion.trim();
    http.end();

    OTA::updated = (latestVersion == currentVersion);

    if(OTA::updated) return S("Firmware up to date, latest version: %s\n", latestVersion) && true;
    
    S("Current version %s, loading updated version %s\n", currentVersion, latestVersion);

    http.begin(firmwareUrl);
      httpCode = http.GET();
      if (httpCode != HTTP_CODE_OK) return S("Failed to fetch firmware: %d\n", httpCode) && false;  
      int contentLength = http.getSize(); 
      if (contentLength <= 0) return S("Content length error: %d\n", contentLength) && false;
      S("Firmware size: %d bytes\n", contentLength);

      if(!Update.begin(contentLength)) return S("Failed to begin update\n") && false;
       
      uint8_t buffer[128];
      size_t written = 0;
      int chunk = contentLength/10;
      int progress = 0;
      int lastProgress = 0;
    
      // Timeout variables
      const unsigned long timeoutDuration = 60e3;  // 1 minute timeout
      unsigned long lastDataTime = millis();

      WiFiClient* client = http.getStreamPtr();

      while (written < contentLength) {

        if (client->available()) {
          size_t len = client->read(buffer, sizeof(buffer));
          if (len > 0) {
            Update.write(buffer, len);
            written += len;
            progress = written / chunk;
            if (progress != lastProgress) {
              Serial.printf("Writing Progress: %d0%%\n", progress);
              lastProgress = progress;
            }
          }
          lastDataTime = millis();
        }

        else if (millis() - lastDataTime > timeoutDuration) break;

        yield();
      }
      
    http.end();

    if (written != contentLength) {
      Update.abort();
      return S("Error: Expected %d but received %d bytes\n", contentLength, written) && false;
    }
    
    if (!Update.end()) return S("Failed to finish the update: %s\n", Update.errorString()) && false;

    OTA::updated = true;
    
    return S("OTA update success, firmware version %s will apply after reboot\n", latestVersion) && true;

  }
};

bool OTA::updated = false;