#define inPin (2)
#define yPin (3)
#define gPin (4)

void setup() {
  pinMode(inPin, INPUT);
  pinMode(yPin, OUTPUT);
  pinMode(gPin, OUTPUT);
  Serial.begin(9600);
}

int yLastTime;
int yInterval = 900;
int yState = false;

int gLastTime;
int gInterval = 1000 / 5;
int gState = false;

void loop() {
  if (millis() - yInterval > yLastTime) {
    yLastTime = millis();
    yState = !yState;
    digitalWrite(yPin, yState);
  }

  if (millis() - gInterval > gLastTime) {
    gLastTime = millis();
    gState = !gState;
    digitalWrite(gPin, gState);
  }
}
