void setup() {
  //
  pinMode(2, INPUT);
}

void printMeter(int value) {
  value = map(value, 0, 1024, 0, 50);
  char out[] = "    1    2    3    4    5    6    7    8    9    X";
  for (int i = 0; i < 50; i++) {
    if (value >= i)
      out[i] = '#';
  }
  Serial.print("| ");
  Serial.print(out);
  Serial.print(" |");
}

// int startTime = 0;
// int lastRead = false;
// int left = 0;
// int total = 0;

// int LEFT = 20;

#define N_LAST_SEEN 10

class RollingAvg {
public:
  int lastValues[N_LAST_SEEN] = {
      //
      -1, -1, -1, -1, -1,
      //
      -1, -1, -1, -1, -1,
      // //
      // -1, -1, -1, -1, -1,
      // //
      // -1, -1, -1, -1, -1,
      //
  };
  int j = 0;

  void add(int value) {
    lastValues[j] = value;
    j++;
    j %= N_LAST_SEEN;
  }

  int getAvg() {
    int total = 0;
    for (int i = 0; i < N_LAST_SEEN; i++) {
      int value = lastValues[j];
      if (value < 0)
        return 0;
      total += lastValues[j];
    }
    return total / N_LAST_SEEN;
  }

  // https://www.geeksforgeeks.org/to-find-smallest-and-second-smallest-element-in-an-array/
  int min2() {
    int i, first, second;

    first = second = 100000;
    for (i = 0; i < N_LAST_SEEN; i++) {
      /* If current element is smaller than first
         then update both first and second */
      if (lastValues[i] < first) {
        second = first;
        first = lastValues[i];
      }

      /* If lastValues[i] is in between first and second
         then update second  */
      else if (lastValues[i] < second && lastValues[i] != first)
        second = lastValues[i];
    }

    return (first + second) / 2;
  }

  int max2() {
    int i, first, second;

    first = second = 0;
    for (i = 0; i < N_LAST_SEEN; i++) {
      /* If current element is smaller than first
         then update both first and second */
      if (lastValues[i] > first) {
        second = first;
        first = lastValues[i];
      }

      /* If lastValues[i] is in between first and second
         then update second  */
      else if (lastValues[i] > second && lastValues[i] != first)
        second = lastValues[i];
    }

    return (first + second) / 2;
  }

  int last2() {
    return (lastValues[(j - 1 + N_LAST_SEEN) % N_LAST_SEEN] +
            lastValues[(j - 2 + N_LAST_SEEN) % N_LAST_SEEN]) /
           2;
  }
};

RollingAvg a0RollingAvg = RollingAvg();
RollingAvg a2RollingAvg = RollingAvg();

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
  a0RollingAvg.add(a0Reading);
  // int a0Diff = a0Reading - a0RollingAvg.getAvg();
  // int a0Base = a0RollingAvg.getAvg();
  int a0Base = 150;
  int a0Diff = a0RollingAvg.last2() - a0Base;
  if (a0Diff > 45) {
    Serial.println(a0Diff);
  }
  int a0Pressed = a0Diff > 60;
  if (a0Pressed && sinceLastA0Press > N_LAST_SEEN) {
    Serial.print(a0Diff);
    Serial.print(" (");
    Serial.print(a0Base);
    Serial.print(" -> ");
    Serial.print(a0RollingAvg.last2());
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

  // int a2Reading = a2Avg.getAvg();
  // a2RollingAvg.add(a2Reading);
  // int a2Pressed = a2Reading - a2RollingAvg.getAvg() > 65;
  // if (a2Pressed && sinceLastA2Press > N_LAST_SEEN) {
  //   Serial.println("Pressed A2!!");
  //   sinceLastA2Press = 0;
  // }
  // sinceLastA2Press++;

  // printMeter(a0Reading);
  // printMeter(a2Reading);
  // Serial.println();

  // printMeter(reading);
  // Serial.print(" ");
  analogWrite(A1, 1000);
  delay(2);
  // printMeter(getAvgReading(A0, 20));
  // Serial.print(reading - avgLastSeen());
  // Serial.println();

  // bool read = digitalRead(2);
  // if (read) {
  //   analogWrite(A1, 1000);
  // } else {
  //   analogWrite(A1, 0);
  // }

  // if (read != lastRead) {
  //   Serial.println();
  //   left = LEFT;
  //   startTime = micros();
  //   total = 0;
  // }

  // if (left > 0) {
  //   int a0 = analogRead(A0);
  //   printMeter(a0);
  //   Serial.println();
  //   left -= 1;
  //   total += a0;
  // } else if (left == 0) {
  //   Serial.print("AVERAGE: ");
  //   Serial.print(total / LEFT);
  //   Serial.println();
  //   printMeter(total / LEFT);
  //   Serial.println();
  //   left = -1;
  // }
  // delay(random(1, 5));

  // lastRead = read;
}

// #include <CapacitiveSensor.h>

/*
 * CapitiveSense Library Demo Sketch
 * Paul Badger 2008
 * Uses a high value resistor e.g. 10 megohm between send pin and receive pin
 * Resistor effects sensitivity, experiment with values, 50 kilohm - 50
 megohm.
 * Larger resistor values yield larger sensor values. Receive pin is the
 sensor
 * pin - try different amounts of foil/metal on this pin Best results are
 * obtained if sensor foil and wire is covered with an insulator such as
 paper
 * or plastic sheet
 */

/*
CapacitiveSensor cs_4_2 =
    CapacitiveSensor(4, 2); // 10 megohm resistor between pins 4 & 2, pin 2 is
                            // sensor pin, add wire, foil
CapacitiveSensor cs_4_5 =
    CapacitiveSensor(1, 0); // 10 megohm resistor between pins 4 & 6, pin 6 is
                            // sensor pin, add wire, foil
CapacitiveSensor cs_4_8 =
    CapacitiveSensor(4, 8); // 10 megohm resistor between pins 4 & 8, pin 8 is
                            // sensor pin, add wire, foil





void setup() {
  cs_4_2.set_CS_AutocaL_Millis(
      0xFFFFFFFF); // turn off autocalibrate on channel 1 - just as an example
  Serial.begin(9600);
}



void loop() {
  long start = millis();
  long total1 = cs_4_2.capacitiveSensor(30);
  long total2 = cs_4_5.capacitiveSensor(30);
  long total3 = cs_4_8.capacitiveSensor(30);
  long abs2 = cs_4_5.capacitiveSensorRaw(30);

  Serial.print(millis() - start); // check on performance in milliseconds
  Serial.print("\t");             // tab character for debug window spacing

  Serial.print(abs2);
  // Serial.print(total1); // print sensor output 1
  // Serial.print("\t");
  // Serial.print(total2); // print sensor output 2
  Serial.println();

  delay(10); // arbitrary delay to limit data to serial port
}
 */
