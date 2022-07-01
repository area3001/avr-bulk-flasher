const { AVR, listSerialPorts } = require("./lib/AVR");
const argv = require("minimist")(process.argv.slice(2));

(async () => {
  const ports = await listSerialPorts();
  if (ports.length === 0) {
    throw new Error("No serial ports found");
  }
  console.log(`Using port(s): ${ports.join(", ")}`);
  for (const port of ports) {
    const avr = new AVR({
      port,
      baudrate: argv.baudrate || 19200,
      device: argv.device || "m328p",
      programmer: argv.programmer || "arduino",
    });
    console.log(`Flashing ${argv.file} on ${port}`);
    const signature = await avr.readSignature();
    console.log("FOUND SIGNATURE", signature);
  }
})().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
