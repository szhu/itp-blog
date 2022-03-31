// Pins
int P1 = 3;
int P2 = 5;
int P3 = 6;
int P4 = 9;

void setup() {
  Serial.begin(9600);
  pinMode(P1, OUTPUT);
  pinMode(P2, OUTPUT);
  pinMode(P3, OUTPUT);
  pinMode(P4, OUTPUT);
}

void debugAnalogWrite(int pin, int value) {
  Serial.print("AnalogWrite(");
  Serial.print(pin);
  Serial.print(", ");
  Serial.print(value);
  Serial.println(");");
  analogWrite(pin, value);
}

void setPins(int delayMs, int p1, int p2, int p3, int p4) {
  debugAnalogWrite(P1, p1);
  debugAnalogWrite(P2, p2);
  debugAnalogWrite(P3, p3);
  debugAnalogWrite(P4, p4);
  delay(delayMs);
}

// Strengths
int _ = 0;    // None
int H = 160;  // Half
int F = 255;  // Full

// Delays
int S = 30;    // Short
int M = 70;    // Medium
int L = 2000;  // Long

void loop() {
  setPins(M, H, _, _, _);
  setPins(S, F, _, _, _);
  setPins(M, H, H, _, _);
  setPins(S, _, F, _, _);
  setPins(M, _, H, H, _);
  setPins(S, _, _, F, _);
  setPins(M, _, _, H, H);
  setPins(S, _, _, _, F);
  setPins(M, _, _, _, H);

  setPins(M, _, _, _, H);
  setPins(S, _, _, _, F);
  setPins(M, _, _, H, H);
  setPins(S, _, _, F, _);
  setPins(M, _, H, H, _);
  setPins(S, _, F, _, _);
  setPins(M, H, H, _, _);
  setPins(S, F, _, _, _);
  setPins(M, H, _, _, _);

  // setPins(L, _, _, _, _);
}
