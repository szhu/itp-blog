// https://googlechrome.github.io/samples/web-bluetooth/get-characteristics-async-await.html?service=21e1aa31-b81f-4c3c-851c-72359b55f3db

uuid = "21e1aa31-b81f-4c3c-851c-72359b55f3db";
if (false) {
  device = await navigator.bluetooth.requestDevice({
    filters: [
      {
        services: [uuid],
      },
    ],
  });
  server = await device.gatt.connect();
}
Promise.resolve(server)
  .then((server) => server.getPrimaryService(uuid))
  .then((service) =>
    service.getCharacteristic("114833ca-f1e2-4d0a-8fff-277881be1ddb")
  )
  .then((characteristic) => {
    let motor1Value = 180n;
    let motor2Value = 180n;
    let musicValue = 1n;
    let value = (motor1Value * 180n + motor2Value) * 2n + musicValue;
    const resetEnergyExpended = Uint16Array.of([value]);
    return characteristic.writeValue(resetEnergyExpended);
  })
  .then((_) => {
    console.log("Done!");
  })
  .catch((error) => {
    console.error(error);
    throw error;
  });
