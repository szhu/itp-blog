/*
  Dim LED

  This example creates a BLE peripheral with service that contains a
  characteristic to control an LED.

  The circuit:
  - Arduino Nano 33 IoT. 1 LED connected to digital pin 2.

  This example code is in the public domain.
*/

#include <ArduinoBLE.h>

BLEService service("19B10000-E8F2-537E-4F6C-D104768A1214"); // create service

// BLE LED Characteristic - custom 128-bit UUID, read and writable by central
BLEIntCharacteristic timeLeftChar("19B10001-E8F2-537E-4F6C-D104768A1214",
                                  BLERead | BLEWrite | BLENotify);

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.begin(9600);
  while (!Serial)
    ;

  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");

    while (true)
      ;
  }

  BLE.setLocalName("Timer");
  BLE.setAdvertisedService(service);
  service.addCharacteristic(timeLeftChar);
  BLE.addService(service);
  timeLeftChar.writeValue(0);
  BLE.advertise();
}

void loop() {
  // listen for BLE peripherals to connect:
  BLEDevice central = BLE.central();

  if (!central)
    return;

  Serial.print(F("Connected to central: "));
  // print the central's MAC address:
  Serial.println(central.address());

  // while the central is still connected to peripheral:
  while (central.connected()) {
    if (timeLeftChar.value() > 0) {
      Serial.println(timeLeftChar.value());
      digitalWrite(LED_BUILTIN, HIGH);
      delay(1000);
      timeLeftChar.writeValue(timeLeftChar.value() - 1);
      if (timeLeftChar.value() == 0) {
        Serial.println("Timer is finished!");
      }
    } else {
      digitalWrite(LED_BUILTIN, LOW);
    }
  }

  // when the central disconnects, print it out:
  Serial.print(F("Disconnected from central: "));
  Serial.println(central.address());
}
