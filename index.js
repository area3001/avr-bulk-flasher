const { AVR, listSerialPorts } = require("./lib/AVR");
const argv = require("minimist")(process.argv.slice(2));

(async () => {
  let ports = [];
  const { file } = argv;
  if (!file) {
    throw new Error("No hex file specified");
  }
  if (argv.port) {
    ports = [argv.port];
  } else {
    ports = await listSerialPorts();
    if (ports.length === 0) {
      throw new Error("No serial ports found");
    }
  }

  console.log(`Using port(s): ${ports.join(", ")}`);
  while (true) {
    for (const port of ports) {
      const avr = new AVR({
        port,
        baudrate: argv.baudrate || 19200,
        device: argv.device || "atmega328p",
        programmer: argv.programmer || "stk500v1",
      });
      console.log(`Flashing ${file} on ${port}`);
      try {
        const signature = await avr.readSignature();
        console.log(
          `Found a signature ${signature}, waiting a second to write fuses`
        );
        await sleep(1000);
        console.log(`Fuses written, waiting a second to flash ${file}`);
        await sleep(1000);
        await avr.flash(file);
        console.log("Waiting for device to reset");
        while (true) {
          await sleep(1000);
          try {
            await avr.readSignature();
            console.log("Device has not reset");
          } catch (error) {
            console.log("Device reset");
            break;
          }
        }
      } catch (error) {
        console.error(error);
      }
      // waiting for device to reset
      while (true) {
        await sleep(1000);
        try {
          await avr.readSignature();
          console.log("Device ready");
        } catch (error) {
          console.log("Device not ready");
          break;
        }
      }
    }
  }
})().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
