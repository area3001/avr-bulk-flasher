const { AVR } = require("../lib/AVR");

test("AVR.test.js", async () => {
  expect.assertions(3);

  try {
    new AVR();
  } catch (error) {
    expect(error).toEqual(Error("No port specified"));
  }

  expect(
    new AVR({
      port: "/dev/tty.usbmodem1411",
    }).buildBaseCommand()
  ).toBe("avrdude -p m328p -c arduino -P /dev/tty.usbmodem1411 -b 19200");

  expect(
    new AVR({
      port: "/dev/tty.usbmodem1412",
      baudrate: "9600",
      device: "atmega328p",
      programmer: "stk500v1",
    }).buildBaseCommand()
  ).toBe("avrdude -p atmega328p -c stk500v1 -P /dev/tty.usbmodem1412 -b 9600");
});
