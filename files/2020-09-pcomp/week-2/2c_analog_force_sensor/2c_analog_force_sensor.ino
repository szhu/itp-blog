void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);
  // declare the led pin as an output:
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
}

void loop() {
  int in0 = analogRead(A0);
  int in1 = analogRead(A1);
  
  int out0 = map(in0, 0, 950, 0, 255);
  int out1 = map(in1, 0, 950, 0, 255);

  Serial.print("in0 = "); Serial.print(in0);
  Serial.print("; ");
  Serial.print("in1 = "); Serial.print(in1);
  Serial.print("; ");
  Serial.print("out0 = "); Serial.print(out0);
  Serial.print("; ");
  Serial.print("out1 = "); Serial.print(out1);
  Serial.print("\n");

  analogWrite(9, out0);
  analogWrite(10, out1);
}
