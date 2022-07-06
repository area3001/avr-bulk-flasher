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
  const { baudrate, device, programmer } = argv;
  for (const port of ports) {
    const avr = new AVR({
      port,
      baudrate,
      device,
      programmer,
    });
    flashLoop(port, file, avr);
  }
})().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

async function flashLoop(port, file, avr) {
  while (true) {
    console.log(`Flashing ${file} on ${port}`);
    try {
      const signature = await avr.readSignature();
      console.log(
        `Found a signature ${signature}, waiting a second to write fuses`
      );
      await sleep(100);
      await avr.writeFuses();
      await sleep(100);
      await avr.flash(file);
      console.log("Waiting for device to reset");
      while (true) {
        await sleep(100);
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
      await sleep(100);
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
