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
#include <Servo.h>

#include "Constants.h"

ESP8266WiFiMulti WiFiMulti;
DynamicJsonBuffer jsonBuffer;
HTTPClient https;

int helixes; // number of candy lanes
int lastUpdated;

void httpUrl(const char* url) {
  if ((WiFiMulti.run() == WL_CONNECTED)) {

    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);

    //    client->setFingerprint(fingerprint);
    client->setInsecure();

    Serial.print("[HTTPS] begin...\n");
    if (https.begin(*client, url)) {  // HTTPS

      Serial.print("[HTTPS] GET...\n");
      // start connection and send HTTP header
      int httpCode = https.GET();

      // httpCode will be negative on error
      if (httpCode > 0) { // TODO----------------------------------------might want to loop on statement----------------------------------------
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTPS] GET... code: %d\n", httpCode);
        // TODO----------------------------------------do something with response----------------------------------------
      } else {
        Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }

      https.end();
    } else {
      Serial.printf("[HTTPS] Unable to connect\n");
    }
  }
}
void firebaseFuncCall(const char* function) {

  if (strcmp(function, "resetMachine")) {
    httpUrl(RESET_ADDRESS);
  }
  if (strcmp(function, "proccess done")) {
    httpUrl(PROCESS_DONE_ADDRESS);
  }
}



void openCart() {
  Servo myservo;  // create servo object to control a servo
  int pos = 0;    // variable to store the servo position
  myservo.attach(CART_SERVO_PIN);  // attaches the servo on pin 9 to the servo object

  for (pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees in steps of 1 degree
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
  for (pos = 180; pos >= 0; pos -= 1) { // goes from 180 degrees to 0 degrees
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
}
JsonObject& getJson(String JsonURL) {
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

void spinStepper(int motorID, int cycles) {
  int dirPin;
  int stepPin;
  //in case of put in machine

  //-----------
  switch (motorID) {
    case 0:
      stepPin = ID0;
      dirPin = ID1;
      break;

    case 1:
      stepPin = ID2;
      dirPin = ID3;
      break;

    case 2:
      stepPin = ID4;
      dirPin = ID5;
      break;

    case 3:
      stepPin = ID6;
      dirPin = ID7;
      break;

    case CART_ID:
      stepPin = CART_STEP_PIN;
      dirPin = CART_DIR_PIN;
      break;

    default:
      dirPin = -1;
      stepPin = -1;
      break;
  }

  if (cycles > 0)
    digitalWrite(dirPin, HIGH); // Enables the motor to move in a particular direction
  else
    digitalWrite(dirPin, LOW);
  for (int i = 0; i < abs(cycles); i++) {
    for (int x = 0; x < CYCLE_PULSES; x++) {
      digitalWrite(stepPin, HIGH);
      delayMicroseconds(MOTOR_SPEED);
      digitalWrite(stepPin, LOW);
      delayMicroseconds(MOTOR_SPEED);
    }
    yield();
  }
}

void helixDeposit(JsonObject& desired) {

  int helixID = desired[DESIRED_HELIX]["integerValue"];
  int cycles = desired[DESIRED_CYCLES]["integerValue"];
  Serial.println("helixDeposit\n");
  if (helixID <= helixes) {
    spinStepper(helixID, cycles);// get machine ready to new snack
    spinStepper(CART_ID, CART_CYCLES * (helixID)); // move cart to chosen helix
    openCart();//open cart
    spinStepper(CART_ID, CART_CYCLES * (helixID) * -1); //move cart to base
  } else {
    Serial.println("ERROR!\n");
    Serial.println("ERROR!\n");
    Serial.println("ERROR!\n");
  }
}

void helixUnload(JsonObject& desired) {
  int helixID = desired[DESIRED_HELIX]["integerValue"];
  int cycles = desired[DESIRED_CYCLES]["integerValue"];
  Serial.println("helixUnload\n");
  Serial.println(helixes);
  Serial.println(helixID);
  if (helixID <= helixes) {
    spinStepper(helixID, cycles);
  } else {
    Serial.println("ERROR!\n");
    Serial.println("ERROR!\n");
    Serial.println("ERROR!\n");
  }
}

void setup() {
  pinMode(ID0, OUTPUT);
  pinMode(ID1, OUTPUT);
  pinMode(ID2, OUTPUT);
  pinMode(ID3, OUTPUT);
  pinMode(ID4, OUTPUT);
  pinMode(ID5, OUTPUT);
  pinMode(ID6, OUTPUT);
  pinMode(ID7, OUTPUT);
  pinMode(ID8, OUTPUT);
  pinMode(IRX, OUTPUT);
  pinMode(ITX, OUTPUT);
  pinMode(ISD2, OUTPUT);
 // pinMode(ISD3, OUTPUT);
  
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

  firebaseFuncCall("resetMachine");
}

void loop() {
  JsonObject& fields = getJson(URL)["fields"];
  JsonObject& desired = fields["properties"]["mapValue"]["fields"]["desired"]["mapValue"]["fields"];

  if (desired[VERSION]["integerValue"].as<int>() != lastUpdated) {
    lastUpdated = desired[VERSION]["integerValue"].as<int>();
    if (!strcmp(desired[ACTION]["stringValue"], ACTION_GET)) {
      Serial.println("get");
      helixUnload(desired);
    } else if (!strcmp(desired[ACTION]["stringValue"], ACTION_PUT)) {
      helixDeposit(desired);
    }
    firebaseFuncCall("proccess done");
  }
  jsonBuffer.clear();
  Serial.println("Wait 10s before next round...");
  delay(1000);

}
