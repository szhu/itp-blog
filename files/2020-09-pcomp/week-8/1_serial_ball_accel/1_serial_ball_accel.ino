#include <Arduino_LSM6DS3.h>

float x, y, z, delta = 0.05;

void setup() {
  Serial.begin(9600);

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");

    while (true)
      ;  // halt program
  }
}

void loop() {
  delay(20);
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
    Serial.print(x);
    Serial.print(",");
    Serial.print(y);
    Serial.print(",");
    Serial.print(z);
  }
  Serial.print("\n");
}
