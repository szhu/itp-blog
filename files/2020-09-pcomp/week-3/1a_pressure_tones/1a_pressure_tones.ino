#define debugInt(varname, suffix) \
  Serial.print(#varname);         \
  Serial.print(" = ");            \
  printLpad((varname), 3);        \
  Serial.print((suffix));

void printLpad(int x, int length) {
  int digits = x == 0 ? 1 : floor(log10(abs(x))) + 1;
  for (int i = digits; i < length; i++) {
    Serial.print(" ");
  }
  Serial.print(x);
}

void setup() {  //
  // tone(8, 440, 10000);
}

void loop() {
  // get a sensor reading:
  int sensorReading = analogRead(A0);
  debugInt(sensorReading, " ; ");

  // map the results from the sensor reading's range
  // to the desired pitch range:
  float frequency = map(sensorReading, 0, 950, 300, 800);
  if (frequency < 0) frequency = 0;
  debugInt(frequency, " ; ");
  // change the pitch, play for 10 ms:
  Serial.print("\n");
  tone(8, frequency, 300);
  delay(300);
}
