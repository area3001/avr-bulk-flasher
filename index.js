const inquirer = require("inquirer");
const argv = require("minimist")(process.argv.slice(2));
const { AVR, listSerialPorts } = require("./lib/AVR");

(async () => {
  const { file } = argv;
  let port = argv.port;

  if (!file) {
    throw new Error("No hex file specified, use the flag '--file <file>'");
  }
  if (!port) {
    const ports = await listSerialPorts();
    if (ports.length === 0) {
      throw new Error("No serial ports found");
    }
    if (ports.length === 1) {
      port = ports[0];
    } else {
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "port",
          message: "Select a port",
          choices: ports,
        },
      ]);
      port = answers.port;
    }
  }

  const { baudrate, device, programmer } = argv;
  const avr = new AVR({
    port,
    baudrate,
    device,
    programmer,
  });
  flashLoop(port, file, avr);
})().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

async function flashLoop(port, file, avr) {
  while (true) {
    await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Press enter to flash new device",
      },
    ]);
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
      console.log("Done");
      // console.log("Waiting for device to reset");
      // while (true) {
      //   await sleep(100);
      //   try {
      //     await avr.readSignature();
      //     console.log("Device has not reset");
      //   } catch (error) {
      //     console.log("Device reset");
      //     break;
      //   }
      // }
    } catch (error) {
      console.error(error.message);
    }
    // waiting for device to reset
    // while (true) {
    //   await sleep(100);
    //   try {
    //     await avr.readSignature();
    //     console.log("Device ready");
    //   } catch (error) {
    //     console.log("Device not ready");
    //     break;
    //   }
    // }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
