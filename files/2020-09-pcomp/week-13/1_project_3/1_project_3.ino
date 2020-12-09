void setup() {}

#define N_LAST_SEEN 10

class RollingWindow {
public:
  int lastValues[N_LAST_SEEN] = {
      //
      -1, -1, -1, -1, -1,
      //
      -1, -1, -1, -1, -1,
      //
  };
  int j = 0;

  void add(int value) {
    lastValues[j] = value;
    j++;
    j %= N_LAST_SEEN;
  }

  int last2() {
    return (lastValues[(j - 1 + N_LAST_SEEN) % N_LAST_SEEN] +
            lastValues[(j - 2 + N_LAST_SEEN) % N_LAST_SEEN]) /
           2;
  }
};

RollingWindow a0RollingWindow = RollingWindow();
RollingWindow a2RollingWindow = RollingWindow();

class RunningAvg {
public:
  int total = 0;
  int n = 0;

  int add(int value) {
    total += value;
    n++;
  }

  int getAvg() { return total / n; }
};

int sinceLastA0Press = 0;
int sinceLastA2Press = 0;

void loop() {
  analogWrite(A1, 0);

  RunningAvg a0Avg = RunningAvg();
  RunningAvg a2Avg = RunningAvg();
  for (int i = 0; i < 20; i++) {
    a0Avg.add(analogRead(A0));
    a2Avg.add(analogRead(A2));
  }

  int a0Reading = a0Avg.getAvg();
  a0RollingWindow.add(a0Reading);

  int a0Base = 150;
  int a0Diff = a0RollingWindow.last2() - a0Base;
  if (a0Diff > 45) {
    Serial.println(a0Diff);
  }
  int a0Pressed = a0Diff > 60;
  if (a0Pressed && sinceLastA0Press > N_LAST_SEEN) {
    Serial.print(a0Diff);
    Serial.print(" (");
    Serial.print(a0Base);
    Serial.print(" -> ");
    Serial.print(a0RollingWindow.last2());
    Serial.print(") ");
    Serial.print("sinceLastA0Press = ");
    Serial.print(sinceLastA0Press);
    if (sinceLastA0Press < N_LAST_SEEN + 5) {
      Serial.print(" Held and");
    }
    Serial.println(" Pressed A0!!");
    sinceLastA0Press = 0;
  }
  sinceLastA0Press++;

  analogWrite(A1, 1000);
  delay(2);
}
