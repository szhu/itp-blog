/*
  WiFi Web Server LED Blink

  A simple web server that lets you blink an LED via the web.
  This sketch will create a new access point (with no password).
  It will then launch a new server and print out the IP address
  to the Serial Monitor. From there, you can open that address in a web browser
  to turn on and off the LED on pin 13.

  If the IP address of your board is yourAddress:
    http://yourAddress/H turns the LED on
    http://yourAddress/L turns it off

  created 25 Nov 2012
  by Tom Igoe
  adapted to WiFi AP by Adafruit
 */

// #include "arduino_secrets.h"
#include <SPI.h>
#include <WiFiNINA.h>
///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = "my network"; // your network SSID (name)
char pass[] =
    "password";   // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0; // your network key index number (needed only for WEP)

int led = LED_BUILTIN;
int status = WL_IDLE_STATUS;
WiFiServer server(80);

int carrotInHole = 0;

void setup() {
  // Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  Serial.println("Access Point Web Server");

  pinMode(led, OUTPUT); // set the LED pin mode

  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true)
      ;
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  // by default the local IP address will be 192.168.4.1
  // you can override it with the following:
  // WiFi.config(IPAddress(10, 0, 0, 1));

  // print the network name (SSID);
  Serial.print("Creating access point named: ");
  Serial.println(ssid);

  // Create open network. Change this line if you want to create an WEP network:
  status = WiFi.beginAP(ssid, pass);
  if (status != WL_AP_LISTENING) {
    Serial.println("Creating access point failed");
    // don't continue
    while (true)
      ;
  }

  // wait 10 seconds for connection:
  // delay(10000);

  // start the web server on port 80
  server.begin();

  // you're connected now, so print out the status
  printWiFiStatus();
}

void loop() {
  // compare the previous status to the current status
  if (status != WiFi.status()) {
    // it has changed update the variable
    status = WiFi.status();

    if (status == WL_AP_CONNECTED) {
      // a device has connected to the AP
      Serial.println("Device connected to AP");
    } else {
      // a device has disconnected from the AP, and we are back in listening
      // mode
      Serial.println("Device disconnected from AP");
    }
  }

  WiFiClient client = server.available(); // listen for incoming clients

  if (client) {
    // if you get a client,
    // print a message out the serial port
    Serial.println("New client.");
    // make a String to hold incoming data from the client
    String currentLine = "";

    int hole = 0;
    char *currentState = NULL;
    char *nextPage = NULL;

    while (client.connected()) { // loop while the client's connected

      // This is required for the Arduino Nano RP2040 Connect -
      // otherwise it will loop so fast that SPI will never be served.
      delayMicroseconds(10);
      if (client.available()) { // if there's bytes to read from the client,
        char c = client.read(); // read a byte, then
        // Serial.write(c);        // print it out the serial monitor
        if (c == '\n') { // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a
          // row. that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {

            // HTTP headers always start with a response code (e.g. HTTP/1.1 200
            // OK) and a content-type so the client knows what's coming, then a
            // blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type: text/html");
            client.println();

            // the content of the HTTP response follows the header:

            // /*

            client.print("<html class='state-");
            client.print(currentState);
            client.print("'>");
            client.print("<head>");
            client.print("<meta charset='utf-8' />");
            client.print("  <meta name='viewport' content='width=device-width, "
                         "user-scalable=no' />");
            if (nextPage) {
              client.print("<meta http-equiv='refresh' content='2; ");
              client.print(nextPage);
              client.print("' />");
            }
            client.print(
                "<style>"
                "body {"
                "text-align: center;"
                "}"
                "p {"
                "height: 15vh;"
                "}"
                "table {"
                "margin: 5em auto;"
                "}"
                "td {"
                "font-size: 10vmin;"
                "line-height: 0.5em;"
                "min-height: 0.5em;"
                "text-align: center;"
                "}"
                "a {"
                "text-decoration: none;"
                "}"
                ""
                ".hidden {"
                "display: none;"
                "}"
                "html.state-initial .initial,"
                "html.state-placed .placed,"
                "html.state-placed .placed,"
                "html.state-help .help,"
                "html.state-no .no,"
                "html.state-found .found,"
                "html.state-hole-1 .hole-1,"
                "html.state-hole-2 .hole-2,"
                "html.state-hole-3 .hole-3 {"
                "display: inline-block;"
                "}"
                "</style>"
                "</head>"
                "<body>"
                "<p class='hidden initial'>"
                "<!--  -->"
                "Peter rabbit needs to store his carrots for the winter. Can "
                "you help him pick a hole?"
                "</p>"
                "<p class='hidden placed'>"
                "<!--  -->"
                "Thank you for your help!"
                "</p>"
                "<p class='hidden help'>"
                "<!--  -->"

                "Spring is here. Help Peter Rabbit find his stored carrots!"
                "</p>"
                "<p class='hidden no'>"
                "<!--  -->"
                "No, they're not there…"
                "</p>"
                "<p class='hidden found'>"
                "<!--  -->"
                "Oh, here they are. Thank you for your help!"
                "</p>"
                "<p class='hidden hole-1 hole-2 hole-3'>"
                "<!--  -->"
                "&hellip;"
                "</p>"
                ""
                "<table>"
                "<tr>"
                "<td><br /></td>"
                "<td colspan='3'>"

                "<span class='hidden initial placed help no found'>🐇</span>"
                "<span class='hidden initial found'>🥕</span>"
                "</td>"
                "<td><br /></td>"
                "</tr>"
                "<tr>"
                "<td><br /></td>"
                "<td><br /></td>"
                "<td><br /></td>"
                "<td><br /></td>"
                "<td><br /></td>"
                "</tr>"
                "<tr>"
                "<td><br /></td>"
                "<td><span class='hidden hole-1'>🐇</span></td>"
                "<td><span class='hidden hole-2'>🐇</span></td>"
                "<td><span class='hidden hole-3'>🐇</span></td>"
                "<td><br /></td>"
                "</tr>"
                "<tr>"
                "<td><br /></td>"
                "<td><a href='?1'>🕳</a></td>"
                "<td><a href='?2'>🕳</a></td>"
                "<td><a href='?3'>🕳</a></td>"
                "<td><br /></td>"
                "</tr>"
                "</table>"
                "</body>"
                "</html>");

            // The HTTP response ends with another blank line:
            client.println();
            // break out of the while loop:
            break;
          } else { // if you got a newline, then clear currentLine:

            if (currentLine.startsWith("GET ")) {
              // Compute page state
              if (currentLine.startsWith("GET /?1 ")) {
                currentState = "hole-1";
                hole = 1;
              } else if (currentLine.startsWith("GET /?2 ")) {
                currentState = "hole-2";
                hole = 2;
              } else if (currentLine.startsWith("GET /?3 ")) {
                currentState = "hole-3";
                hole = 3;
              } else if (currentLine.startsWith("GET /?placed ")) {
                currentState = "placed";
                nextPage = "?";
              } else if (currentLine.startsWith("GET /?no ")) {
                currentState = "no";
                nextPage = "?";
              } else if (currentLine.startsWith("GET /?found ")) {
                currentState = "found";
                nextPage = "?";
              } else {
                if (carrotInHole) {
                  currentState = "help";
                } else {
                  currentState = "initial";
                }
              }
              if (hole) {
                if (carrotInHole) {
                  if (hole == carrotInHole) {
                    nextPage = "?found";
                    carrotInHole = 0;
                  } else {
                    nextPage = "?no";
                  }
                } else {
                  carrotInHole = hole;
                  nextPage = "?";
                }
              }

              Serial.print("> currentState: ");
              Serial.println(currentState);
              Serial.print("> carrotInHole: ");
              Serial.println(carrotInHole);
            }

            currentLine = "";
          }
        } else if (c != '\r') { // if you got anything else but a carriage
                                // return character,
          currentLine += c;     // add it to the end of the currentLine
        }

        // Check to see if the client request was "GET /H" or "GET /L":
        if (currentLine.endsWith("GET /H")) {
          digitalWrite(led, HIGH); // GET /H turns the LED on
        }
        if (currentLine.endsWith("GET /L")) {
          digitalWrite(led, LOW); // GET /L turns the LED off
        }
      }
    }
    // close the connection:
    client.stop();
    Serial.println("Client disconnected.");
    Serial.println();
  }
}

void printWiFiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print where to go in a browser:
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}
