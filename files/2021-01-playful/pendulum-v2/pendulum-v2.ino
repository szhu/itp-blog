#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

float rotation = 0;

namespace Accel {
  float x, y, z, delta = 0.05;

  void setup() {
    if (!IMU.begin()) {
      Serial.println("Failed to initialize IMU!");

      while (true)
        ; // halt program
    }
  }

  void loop() {
    if (IMU.accelerationAvailable()) {
      IMU.readAcceleration(x, y, z);
    }
  }
} // namespace Accel

namespace Blue {
  BLEService service("68d458d2-ceac-440f-b61a-bb620043c147");
  BLEIntCharacteristic characteristic("055c1935-8461-4c9c-b186-3bb141899a63",
                                      BLERead | BLENotify);
  BLEDevice central;
  bool wasCentralConnected = false;

  void setup() {
    if (!BLE.begin()) {
      Serial.println("starting BLE failed!");

      while (true) {
      }
    }

    BLE.setLocalName("Pendulum Sensor");
    BLE.setAdvertisedService(service);
    service.addCharacteristic(characteristic);
    BLE.addService(service);
    characteristic.writeValue(0);
    BLE.advertise();
  }

  void loop() {
    if (!wasCentralConnected) {
      central = BLE.central();
      if (central) {
        Serial.print(F("Connected to central: "));
        Serial.println(central.address());
        wasCentralConnected = true;
      } else {
        return;
      }
    }

    if (central.connected()) {
      characteristic.writeValue((4 - rotation) * 1000);
    } else {
      // when the central disconnects, print it out:
      Serial.print(F("Disconnected from central: "));
      Serial.println(central.address());

      wasCentralConnected = false;
    }
  }
} // namespace Blue

void setup() {
  //
  Serial.begin(9600);
  Accel::setup();
  Blue::setup();
}

void loop() {
  delay(20);
  //
  Accel::loop();

  if (Accel::x < 0) {
    if (Accel::z > 0) {
      // Quadrant 1
      rotation = -Accel::x;
    } else {
      // Quadrant 2
      rotation = 2 + Accel::x;
    }
  } else {
    if (Accel::z < 0) {
      // Quadrant 3
      rotation = 2 + Accel::x;
    } else {
      // Quadrant 4
      rotation = 4 - Accel::x;
    }
  }
  Serial.print(Accel::x);
  Serial.print(",");
  Serial.print(Accel::y);
  Serial.print(",");
  Serial.print(Accel::z);
  Serial.print(" => ");
  Serial.print(rotation);
  Serial.print("\n");

  Blue::loop();
}
