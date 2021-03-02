/*
ex: Hand 7mm away


*/



#define SENSOR_MIN 5
#define SENSOR_MAX 220


void loop() {
  // Text
  arcada.display->fillScreen(ARCADA_BLACK);
  arcada.display->setCursor(0, 0);

  // float lux = vl.readLux(VL6180X_ALS_GAIN_5);
  // Serial.print("Lux: "); Serial.println(lux);

  // Read sensors
  uint8_t range = vl.readRange();
  uint8_t status = vl.readRangeStatus();

  if (status == VL6180X_ERROR_NONE) {
    // No error

    // Text
    arcada.display->setTextColor(ARCADA_GREEN);
    arcada.display->print("Range: ");
    arcada.display->print(range);
    arcada.display->print(" mm");

    // Pixels
    arcada.pixels.clear();
    int pixelCount = map(range, SENSOR_MIN, SENSOR_MAX, 1, 5);
    int blueValue = map(range, SENSOR_MIN, SENSOR_MAX, 0, 256);
    uint32_t color = arcada.pixels.Color(255, 0, blueValue);
    arcada.pixels.fill(color, 0, pixelCount);

    // Sound
    int pitch = map(range, SENSOR_MIN, SENSOR_MAX, 120, 1500);
    tone(sound_pin, pitch, 10);
  } else {
    // Error

    // Text
    arcada.display->setTextColor(ARCADA_RED);
    arcada.display->print("Error: ");
    arcada.display->println(errorStringFor(status));

    // Pixels
    arcada.pixels.clear();
  }
  arcada.pixels.show();
  delay(50);
}
