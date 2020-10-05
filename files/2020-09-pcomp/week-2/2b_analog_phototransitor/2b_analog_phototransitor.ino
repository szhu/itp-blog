int ledPin = 9;

void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);
  // declare the led pin as an output:
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int in = analogRead(A0);
  
  int out = 255 - map(in, 0, 10, 0, 255);
  if (out < 0) {
    out = 0;
  }

  Serial.print("in = ");
  Serial.print(in);
  Serial.print("; out = ");
  Serial.println(out);
  
  analogWrite(ledPin, out);
}
