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

void setup() {
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, INPUT);
}

bool prevButtonState = 0;
bool light = 0;

void loop() {
  bool buttonState = digitalRead(4);
  if (prevButtonState == 1 && buttonState == 0) {
    light = !light;
  }

  debugInt(buttonState, " ; ");
  debugInt(prevButtonState, " ; ");
  debugInt(light, " ; ");
  Serial.print("\n");

  analogWrite(3, 100);
  analogWrite(2, light * 255);

  prevButtonState = buttonState;
}
