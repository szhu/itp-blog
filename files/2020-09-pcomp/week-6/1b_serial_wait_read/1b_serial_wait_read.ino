int switchPin = 3;

void setup() {
  Serial.begin(9600);
  pinMode(switchPin, INPUT);

  while (Serial.available() <= 0) {
    Serial.println("hello");  // send a starting message
    delay(300);               // wait 1/3 second
  }
}

void loop() {
  if (Serial.available()) {
    // read the incoming byte:
    int inByte = Serial.read();
    // read the sensor:
    int sensorValue = analogRead(A0);
    // print the results:
    Serial.print(sensorValue);
    Serial.print(",");

    // read the sensor:
    sensorValue = analogRead(A1);
    // print the results:
    Serial.print(sensorValue);
    Serial.print(",");

    // read the sensor:
    sensorValue = digitalRead(switchPin);
    // print the results:
    Serial.println(sensorValue);
  }
}
