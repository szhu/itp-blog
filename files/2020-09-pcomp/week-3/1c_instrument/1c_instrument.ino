#include "pitches.h"

// minimum reading of the sensors that generates a note
const int threshold = 100;
const int speakerPin = 8;      // pin number for the speaker
const int noteDuration = 300;  // play notes for 20 ms

// notes to play, corresponding to the 3 sensors:
int notes[] = {NOTE_A4, NOTE_B4, NOTE_C5};

void setup() {}

void loop() {
  for (int thisSensor = 0; thisSensor < 3; thisSensor++) {
    // get a sensor reading:
    int sensorReading = analogRead(thisSensor);

    // if the sensor is pressed hard enough:
    if (sensorReading > threshold) {
      // play the note corresponding to this sensor:
      tone(speakerPin, notes[thisSensor], noteDuration);
    }
  }
  delay(noteDuration);
}
