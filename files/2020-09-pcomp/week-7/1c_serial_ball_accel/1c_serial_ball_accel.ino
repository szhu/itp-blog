// This is my attempt at using the accelerometer. It doesn't seem to work!

#include <Arduino_LSM9DS1.h>

float x, y, z, delta = 0.05;

void setup() { Serial.begin(9600); }

void loop() {
  Serial.println("Hello!!");
  // delay(500);
  Serial.println(IMU.accelerationAvailable());
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
    Serial.print(x);
    Serial.print(",");
    Serial.print(y);
    Serial.print(",");
    Serial.print(z);
    Serial.print("\n");

    if (y <= delta && y >= -delta)
      Serial.println("flat");
    else if (y > delta && y < 1 - delta)
      Serial.println("tilted to the left");
    else if (y >= 1 - delta)
      Serial.println("left");
    else if (y < -delta && y > delta - 1)
      Serial.println("tilted to the right");
    else
      Serial.println("right");
  }
}
