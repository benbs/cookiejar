/**
   BasicHTTPSClient.ino

    Created on: 20.08.2018

*/

#include <Arduino.h>
#include <ArduinoJson.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>

#include "Constants.h"

ESP8266WiFiMulti WiFiMulti;
DynamicJsonBuffer jsonBuffer;
HTTPClient https;

int helixes; // number of candy lanes
int lastUpdated;


JsonObject& getJson(String JsonURL){
  JsonObject& doc = jsonBuffer.parseObject("{}");
  if ((WiFiMulti.run() == WL_CONNECTED)) {

    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);

//    client->setFingerprint(fingerprint);
    client->setInsecure();

    Serial.print("[HTTPS] begin...\n");
    if (https.begin(*client, JsonURL)) {  // HTTPS

      Serial.print("[HTTPS] GET...\n");
      // start connection and send HTTP header
      int httpCode = https.GET();

      // httpCode will be negative on error
      if (httpCode > 0) {
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTPS] GET... code: %d\n", httpCode);

        // file found at server
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = https.getString();
        
          JsonObject& doc2 = jsonBuffer.parseObject(payload);
          https.end();
          return doc2;
          
        }
      } else {
        Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }

      https.end();
    } else {
      Serial.printf("[HTTPS] Unable to connect\n");
    }
  }
  return doc;
}

void spinStepper(int motorID, int cycles){
  int dirPin;
  int stepPin;
  
  switch (motorID){
    case 0:
      stepPin = D0;
      dirPin = D1;
      break;
      
    case 1:
      stepPin = D2;
      dirPin = D3;
      break;
    
    case 2:
      stepPin = 2;
      dirPin = 14;
      break;
      
    case 3:
      stepPin = 12;
      dirPin = 13;
      break;

    default:
      dirPin = -1;
      stepPin = -1;
      break;  
  }
  if(cycles > 0)
    digitalWrite(dirPin,HIGH); // Enables the motor to move in a particular direction
  else
    digitalWrite(dirPin,LOW);
  for(int i = 0; i < abs(cycles); i++){
    for(int x = 0; x < CYCLE_PULSES; x++) {
      digitalWrite(stepPin,HIGH); 
      delayMicroseconds(MOTOR_SPEED); 
      digitalWrite(stepPin,LOW); 
      delayMicroseconds(MOTOR_SPEED); 
    }
    yield();
  }
}

void helixDeposit(JsonObject& desired){
  
  int helixID = desired[DESIRED_HELIX]["integerValue"];
  int cycles = desired[DESIRED_CYCLES]["integerValue"];
  Serial.println("helixDeposit\n");
  if(helixID <= helixes){
    spinStepper(helixID, cycles);
  } else{
    Serial.println("ERROR!\n"); 
    Serial.println("ERROR!\n"); 
    Serial.println("ERROR!\n"); 
  }
}

void helixUnload(JsonObject& desired){
  int helixID = desired[DESIRED_HELIX]["integerValue"];
  int cycles = desired[DESIRED_CYCLES]["integerValue"];
  if(helixID <= helixes){
    spinStepper(helixID, cycles);
  } else{
    Serial.println("ERROR!\n"); 
    Serial.println("ERROR!\n"); 
    Serial.println("ERROR!\n"); 
  }
}

void setup() {
  pinMode(D0,OUTPUT); 
  pinMode(D1,OUTPUT);
  pinMode(D2,OUTPUT); 
  pinMode(D3,OUTPUT);
  pinMode(D4,OUTPUT); 
  pinMode(D5,OUTPUT);
  pinMode(D6,OUTPUT); 
  pinMode(D7,OUTPUT);
  pinMode(D8,OUTPUT); 
  
  Serial.begin(115200);
  // Serial.setDebugOutput(true);
  Serial.println("ver 4.0\n");
  for (uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] WAIT %d...\n", t);
    Serial.flush();
    delay(1000);
  }

  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP(SSID, PASSWORD);
  JsonObject& data = getJson(URL)["fields"];
  helixes = data["slotCount"]["integerValue"].as<int>();
  lastUpdated = data["properties"]["mapValue"]["fields"]["desired"]["mapValue"]["fields"][VERSION]["integerValue"].as<int>(); 
}

void loop() {
  JsonObject& fields = getJson(URL)["fields"];
  JsonObject& desired = fields["properties"]["mapValue"]["fields"]["desired"]["mapValue"]["fields"];
  
  if(desired[VERSION]["integerValue"].as<int>() != lastUpdated){
    lastUpdated = desired[VERSION]["integerValue"].as<int>();
    if(!strcmp(desired[ACTION]["stringValue"],ACTION_GET)){
      helixDeposit(desired);
    } else if(!strcmp(desired[ACTION]["stringValue"],ACTION_PUT)){
      helixUnload(desired);
    }
  }
  jsonBuffer.clear();
  Serial.println("Wait 10s before next round...");
  delay(1000);
  
}
