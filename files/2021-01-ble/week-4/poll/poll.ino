/*
  LED

  This example creates a BLE peripheral with service that contains a
  characteristic to control an LED.

  The circuit:
  - Arduino MKR WiFi 1010, Arduino Uno WiFi Rev2 board, Arduino Nano 33 IoT,
    Arduino Nano 33 BLE, or Arduino Nano 33 BLE Sense board.

  You can use a generic BLE central app, like LightBlue (iOS and Android) or
  nRF Connect (Android), to interact with the services and characteristics
  created in this sketch.

  This example code is in the public domain.
*/

#include <ArduinoBLE.h>

BLEService
    ledService("19B10000-E8F2-537E-4F6C-D104768A1214"); // BLE LED Service

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by
// central
BLEByteCharacteristic
    switchCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214",
                         BLERead | BLEWrite);

const int ledPin = LED_BUILTIN; // pin to use for the LED

#define N_CANDIDATES 5
int votes[N_CANDIDATES] = {0, 0, 0, 0, 0};

void setup() {
  Serial.begin(9600);
  while (!Serial)
    ;

  // set LED pin to output mode
  pinMode(ledPin, OUTPUT);

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");

    while (1)
      ;
  }

  // set advertised local name and service UUID:
  BLE.setLocalName("Voting Booth");
  BLE.setAdvertisedService(ledService);

  // add the characteristic to the service
  ledService.addCharacteristic(switchCharacteristic);

  // add service
  BLE.addService(ledService);

  // set the initial value for the characeristic:
  switchCharacteristic.writeValue(0);

  // start advertising
  BLE.advertise();

  Serial.println("Voting Booth");
}

int value = 0;

void updateValue() {
  if (switchCharacteristic.written()) {
    value = switchCharacteristic.value();
    votes[value]++;
    Serial.print("New vote: ");
    Serial.print(value);
    Serial.println();

    Serial.print("Current votes: ");
    Serial.println();
    for (int i = 0; i < N_CANDIDATES; i++) {
      Serial.print("  Candidate ");
      Serial.print(i);
      Serial.print(" has ");
      Serial.print(votes[i]);
      Serial.print(" votes");
      Serial.println();
    }
    Serial.println();
  }
}

void loop() {
  // listen for BLE peripherals to connect:
  BLEDevice central = BLE.central();

  // if a central is connected to peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());

    // while the central is still connected to peripheral:
    while (central.connected()) {
      updateValue();
      delay(value * 100);
      analogWrite(A0, 255);

      updateValue();
      delay(value * 100);
      analogWrite(A0, 0);
    }

    // when the central disconnects, print it out:
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}
