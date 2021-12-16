#include <ArduinoBLE.h>
#include <Servo.h>

void exit() {
  while (true);
}

#define printValue(val) \
  Serial.print(#val); \
  Serial.print(" = "); \
  Serial.print(val); \
  Serial.print("  ");

namespace BleConnection {
  char serviceName[] = "BLE Controlled Ice Cream Car -- Pauline / Sean";
  BLEService service("21e1aa31-b81f-4c3c-851c-72359b55f3db");
  BLEWordCharacteristic characteristic("114833ca-f1e2-4d0a-8fff-277881be1ddb", BLERead | BLEWrite);
  BLEDevice central;
  bool isConnected = false;
  bool hasCentral = false;

  void setup() {
    if (!BLE.begin()) {
      Serial.println("[BLE] Error: Starting BLE failed!");
      exit();
    }

    BLE.setLocalName(serviceName);
    BLE.setAdvertisedService(service);
    service.addCharacteristic(characteristic);
    BLE.addService(service);
    characteristic.writeValue(0);
    BLE.advertise();
  }

  void loop() {
    if (hasCentral) {
      isConnected = central.connected();
      if (!isConnected) {
        hasCentral = false;
        Serial.println("[BLE] Disconnected from central.");
      }
    } else {
      central = BLE.central();
      hasCentral = !!central;
      if (central && central.connected()) {
        isConnected = central.connected();
        if (isConnected) {
          Serial.print("[BLE] Connected to central: ");
          Serial.println(central.address());
        }
      }
    }
  }
}

namespace Servos {
  Servo music;
  Servo motor1;
  Servo motor2;

  void attach() {
    music.attached() || music.attach(10);
    motor1.attached() || motor1.attach(11);
    motor2.attached() || motor2.attach(12);
  }

  void detach() {
    music.detach();
    motor1.detach();
    motor2.detach();
  }

  void write(int stopValue, int musicValue, int motor1Value, int motor2Value) {
    attach();
    musicValue == stopValue ? music.detach() : music.write(musicValue);
    motor1Value == stopValue ? motor1.detach() : motor1.write(motor1Value);
    motor2Value == stopValue ? motor2.detach() : motor2.write(motor2Value);
  }
}

const int STOP = 90;
int numReceivedCommands = 0;

void receiveValue() {
  if (!BleConnection::isConnected) {
    Servos::detach();
    return;
  }

  if (!BleConnection::characteristic.written()) return;

  if (numReceivedCommands == 0) {    
    numReceivedCommands++;
    return;
  }

  word value = BleConnection::characteristic.value();
  bool isMusicOn = value & 1;

  value >>= 1;
  int motor1Value = value / 180;
  int motor2Value = value % 180;

  Serial.print("[receiveValue] ");
  printValue(isMusicOn);
  printValue(motor1Value);
  printValue(motor2Value);
  Serial.println();

  Servos::write(
    STOP,
    isMusicOn ? 180 : STOP,
    motor1Value + (STOP - 90),
    motor2Value + (STOP - 90)
  );
}

void setup() {
  BleConnection::setup();
  if (!BleConnection::isConnected) {
    numReceivedCommands = 0;
  }
}

void loop() {
  BleConnection::loop();
  receiveValue();
}
