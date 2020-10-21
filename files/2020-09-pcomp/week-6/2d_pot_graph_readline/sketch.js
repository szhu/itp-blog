let serial; // variable to hold an instance of the serialport library
let portName = "/dev/tty.usbmodem14201"; // fill in your serial port name here
let inData; // for incoming serial data
let xPos = 0; // x position of the graph

function setup() {
  createCanvas(400, 300); // make the canvas
  background(0x08, 0x16, 0x40);
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on("data", serialEvent); // callback for when new data arrives
  serial.on("error", serialError); // callback for errors
  serial.open(portName); // open a serial port
}

function draw() {
  graphData(inData);
}

function graphData(newData) {
  // map the range of the input to the window height:
  var yPos = map(newData, 0, 255, 0, height);
  // draw the line in a pretty color:
  stroke(0xa8, 0xd9, 0xa7);
  line(xPos, height, xPos, height - yPos);
  // at the edge of the screen, go back to the beginning:
  if (xPos >= width) {
    xPos = 0;
    // clear the screen by resetting the background:
    background(0x08, 0x16, 0x40);
  } else {
    // increment the horizontal position for the next reading:
    xPos++;
  }
}

function serialEvent() {
  // read a string from the serial port:
  var inString = serial.readLine();
  // check to see that there's actually a string there:
  if (inString.length > 0) {
    // convert it to a number:
    inData = Number(inString);
  }
}

function serialError(err) {
  console.log("Something went wrong with the serial port. " + err);
}
