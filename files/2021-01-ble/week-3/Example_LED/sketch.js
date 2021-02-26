// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "19b10000-e8f2-537e-4f6c-d104768a1214";
let myCharacteristic;
let input;
let slider;
let myBLE;

function setup() {
  myBLE = new p5ble();

  // Create a 'Connect' button
  const connectButton = createButton("Connect");
  connectButton.mousePressed(connectToBle);

  createButton("Strobe speed:");
  createButton("0ms");

  // Create slider
  slider = createSlider(0, 10, 5);
  slider.input(writeToBle);

  createButton("1000ms");
}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  if (error) console.log("error: ", error);
  console.log("characteristics: ", characteristics);
  // Set the first characteristic as myCharacteristic
  myCharacteristic = characteristics[0];
}

function writeToBle() {
  const inputValue = slider.value();
  // Write the value of the input to the myCharacteristic
  myBLE.write(myCharacteristic, inputValue);
}
