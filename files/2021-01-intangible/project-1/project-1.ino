
#include <Adafruit_VL53L0X.h>

Adafruit_VL53L0X vl = Adafruit_VL53L0X();

char *errorStringFor(uint8_t status) {
  switch (status) {
  case VL53L0X_ERROR_NONE:
    return "VL53L0X_ERROR_NONE";
  case VL53L0X_ERROR_CALIBRATION_WARNING:
    return "VL53L0X_ERROR_CALIBRATION_WARNING";
  case VL53L0X_ERROR_MIN_CLIPPED:
    return "VL53L0X_ERROR_MIN_CLIPPED";
  case VL53L0X_ERROR_UNDEFINED:
    return "VL53L0X_ERROR_UNDEFINED";
  case VL53L0X_ERROR_INVALID_PARAMS:
    return "VL53L0X_ERROR_INVALID_PARAMS";
  case VL53L0X_ERROR_NOT_SUPPORTED:
    return "VL53L0X_ERROR_NOT_SUPPORTED";
  case VL53L0X_ERROR_RANGE_ERROR:
    return "VL53L0X_ERROR_RANGE_ERROR";
  case VL53L0X_ERROR_TIME_OUT:
    return "VL53L0X_ERROR_TIME_OUT";
  case VL53L0X_ERROR_MODE_NOT_SUPPORTED:
    return "VL53L0X_ERROR_MODE_NOT_SUPPORTED";
  case VL53L0X_ERROR_BUFFER_TOO_SMALL:
    return "VL53L0X_ERROR_BUFFER_TOO_SMALL";
  case VL53L0X_ERROR_GPIO_NOT_EXISTING:
    return "VL53L0X_ERROR_GPIO_NOT_EXISTING";
  case VL53L0X_ERROR_GPIO_FUNCTIONALITY_NOT_SUPPORTED:
    return "VL53L0X_ERROR_GPIO_FUNCTIONALITY_NOT_SUPPORTED";
  case VL53L0X_ERROR_INTERRUPT_NOT_CLEARED:
    return "VL53L0X_ERROR_INTERRUPT_NOT_CLEARED";
  case VL53L0X_ERROR_CONTROL_INTERFACE:
    return "VL53L0X_ERROR_CONTROL_INTERFACE";
  case VL53L0X_ERROR_INVALID_COMMAND:
    return "VL53L0X_ERROR_INVALID_COMMAND";
  case VL53L0X_ERROR_DIVISION_BY_ZERO:
    return "VL53L0X_ERROR_DIVISION_BY_ZERO";
  case VL53L0X_ERROR_REF_SPAD_INIT:
    return "VL53L0X_ERROR_REF_SPAD_INIT";
  case VL53L0X_ERROR_NOT_IMPLEMENTED:
    return "VL53L0X_ERROR_NOT_IMPLEMENTED";
  default:
    return "UNKNOWN ERROR";
  }
}

void setup() {
  Serial.begin(9600);
  while (!Serial)
    ;

  //
  vl.begin();
}

void loop() {
  //
  uint8_t range = vl.readRange();
  uint8_t status = vl.readRangeStatus();

  if (status == VL53L0X_ERROR_NONE) {
    Serial.print(range);
    Serial.println();
  } else {
    return;
    Serial.print(range);
    Serial.print(" ---> ");
    Serial.print(status);
    Serial.print(" ");
    Serial.print(errorStringFor(status));
    Serial.println();
  }

  delay(50);
}
