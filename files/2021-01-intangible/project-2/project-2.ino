#include "Arduino_APDS9960.h"

void setup() {
  Serial.begin(9600);
  // wait for Serial Monitor to open:
  while (!Serial)
    ;

  Serial.println("hi");

  // if the sensor doesn't initialize, let the user know:
  while (!APDS.begin()) {
    Serial.println("APDS9960 sensor not working. Check your wiring.");

    delay(1000);
  }

  Serial.println("Sensor is working");
}

void loop() {
  // red, green, blue, clear channels:
  int r, g, b, c;

  // if the sensor has a reading:
  if (APDS.colorAvailable()) {

    // read the color
    APDS.readColor(r, g, b, c);

    // print the values
    Serial.print(r);
    Serial.print(",");
    Serial.print(g);
    Serial.print(",");
    Serial.print(b);
    Serial.print(",");
    Serial.println(c);

    delay(100);
  }
}
