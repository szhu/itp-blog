const int ledPin = 5;  // the pin that the LED is attached to
int incomingByte;      // a variable to read incoming serial data into

void setup() {
  Serial.begin(9600);       // initialize serial communication
  pinMode(ledPin, OUTPUT);  // initialize the LED pin as an output
}

void loop() {
  if (Serial.available() > 0) {    // see if there's incoming serial data
    incomingByte = Serial.read();  // read it
    Serial.println(incomingByte);
    if (incomingByte == 'h') {     // if it's a capital H (ASCII 72),
      digitalWrite(ledPin, HIGH);  // turn on the LED
      // if you're using a speaker instead of an LED, uncomment line below  and
      // comment out the previous line:
      //  tone(5, 440);           // play middle A on pin 5
    }
    if (incomingByte == 'l') {    // if it's an L (ASCII 76)
      digitalWrite(ledPin, LOW);  // turn off the LED
      // if you're using a speaker instead of an LED, uncomment line below  and
      // comment out the previous line: noTone(5);
    }
  }
}
