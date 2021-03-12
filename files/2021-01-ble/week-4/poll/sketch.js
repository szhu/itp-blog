// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "19b10000-e8f2-537e-4f6c-d104768a1214";

let myBLE;
let myCharacteristic;

const $id = (id) => document.getElementById(id);
const $ = (el) => document.querySelectorAll(el);

function setup() {
  myBLE = new p5ble();

  $id("connect").addEventListener("click", connectToBle);

  for (let button of $("button.vote")) {
    button.addEventListener("click", (e) =>
      sendValueToBle(e.target.getAttribute("data-value"))
    );
  }
}

function connectToBle() {
  $id("connect").innerText = "Connecting";
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  if (error) console.log("error: ", error);
  console.log("characteristics: ", characteristics);
  // Set the first characteristic as myCharacteristic
  myCharacteristic = characteristics[0];

  $id("connect").innerText = "Connected";
  for (let button of $("button.vote")) {
    button.disabled = false;
  }
}

function sendValueToBle(value) {
  // Write the value of the input to the myCharacteristic
  myBLE.write(myCharacteristic, parseInt(value));
}
