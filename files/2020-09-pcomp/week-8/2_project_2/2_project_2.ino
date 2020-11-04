void setup() {}

void printMeterLn(int value) {
  value = map(value, 000, 1024, 0, 50);
  char out[] = "    1    2    3    4    5    6    7    8    9    X";
  for (int i = 0; i < 50; i++) {
    if (value >= i)
      out[i] = '#';
  }
  Serial.print("| ");
  Serial.print(out);
  Serial.print(" |");
}

void loop() {
  int a0 = analogRead(A0);
  printMeterLn(a0);
  int a1 = analogRead(A1);
  printMeterLn(a1);
  Serial.println();
  delay(50);
}
