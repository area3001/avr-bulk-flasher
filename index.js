const inquirer = require("inquirer");
const argv = require("minimist")(process.argv.slice(2));
// const { AVR, listSerialPorts } = require("./lib/AVR");
const { ESP, listSerialPorts } = require("./lib/ESP");

(async () => {
  while (true) {
    ports = await listSerialPorts();
    if (ports.length === 0) {
      console.log("No ports found. Please connect your device and try again.");
      await sleep(1000);
      continue;
    }
    const promises = ports.map(async (port) => {
      const esp = new ESP({ port });
      try {
        await esp.flash();
      } catch (error) {
        console.error(error.message);
      }
    });
    await Promise.all(promises);
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Press enter to flash new device",
      },
    ]);
    if (!confirm) {
      break;
    }
  }
})().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
