int NPins = 6;
int Pins[] = {3, 5, 6, 9, 10, 11};
int SwitchPin = 2;

// Strengths
int _ = 0;   // None
int H = 160; // Half
int F = 255; // Full

// Delays
int S = 30;   // Short
int M = 70;   // Medium
int L = 1000; // Long

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < NPins; i++) {
    pinMode(Pins[i], OUTPUT);
  }
}

bool reverse = false;

// Reverse pin index, if needed.
int xform(int i) { return reverse ? NPins - i - 1 : i; }

void debugAnalogWrite(int pin, int value) {
  Serial.print("AnalogWrite(");
  Serial.print(pin);
  Serial.print(", ");
  Serial.print(value);
  Serial.println(");");
  analogWrite(pin, value);
}

void go() {
  for (int i = 0; i <= NPins; i++) {
    int prev = i == 0 ? 0 : Pins[xform(i - 1)];
    int curr = i == NPins ? 0 : Pins[xform(i)];

    if (prev)
      debugAnalogWrite(prev, H);
    if (curr)
      debugAnalogWrite(curr, H);
    delay(M);

    if (prev)
      debugAnalogWrite(prev, _);
    if (curr)
      debugAnalogWrite(curr, F);
    delay(S);
  }

  Serial.println();
  delay(L);
}

void loop() {
  reverse = digitalRead(SwitchPin);
  go();
}
