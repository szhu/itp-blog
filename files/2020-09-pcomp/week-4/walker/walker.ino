#include "Servo.h"  // include the servo library

Servo servoMotor;  // creates an instance of the servo object to control a servo
int servoPin = 3;  // Control pin for servo motor

void setup() {
  Serial.begin(9600);  // initialize serial communications
  // attaches the servo on pin 3 to the servo object
  servoMotor.attach(servoPin);
}

void loop() {
  int analogValue = analogRead(A0);  // read the analog input
  Serial.println(analogValue);       // print it

  // if your sensor's range is less than 0 to 1023, you'll need to
  // modify the map() function to use the values you discovered:
  int servoAngle = map(analogValue, 0, 1023, 0, 30);

  // move the servo using the angle from the sensor:
  servoMotor.write(servoAngle);
}
