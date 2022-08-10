const { $ } = require("./spawn");
const SerialPort = require("serialport").SerialPort;

class ESP {
  constructor(options = {}) {
    const { port, baudrate } = options;
    if (!port) {
      throw new Error("No port specified");
    }
    this.port = port;
    this.baudrate = baudrate || 921600;
  }

  buildBaseCommand() {
    const { port } = this;
    // return `avrdude -p ${device} -c ${programmer} -P ${port} -b ${baudrate}`;
    return `esptool.py --chip esp32 --port ${port}`;
  }

  async flash() {
    // return await $(this.buildBaseCommand(), ["-U", `flash:w:${file}:i`]);
    const extras = `--baud ${this.baudrate} --before default_reset --after hard_reset --chip esp32 write_flash --flash_mode dio --flash_size detect --flash_freq 40m 0x1000 ./bins/bootloader.bin 0x8000 ./bins/partition-table.bin 0x10000 ./bins/micropython.bin`;
    // const extras = `
    // --baud ${this.baudrate} \
    // --before default_reset \
    // --after hard_reset \
    // write_flash -z \
    // --flash_mode dio \
    // --flash_freq 80m \
    // --flash_size detect \
    // 0xe000 ./bins/boot_app0.bin \
    // 0x1000 ./bootloader.bin \
    // 0x10000 ./micropython.bin \
    // 0x8000 ./defaultFirmware.pde.partitions.bin `;
    return await $(this.buildBaseCommand(), extras.split(" "));
  }

  async readSignature() {
    let log = "";
    try {
      log = (await $(this.buildBaseCommand(), ["flash_id"])).combined;
      console.log("LOGGING", log);
      if (log.includes("A fatal error occurred")) {
        throw new Error("Invalid device signature");
      }
      const result = log.match(/MAC: (\S\S:\S\S:\S\S:\S\S:\S\S:\S\S)/g);
      if (!result) {
        throw new Error("Invalid device signature");
      }
      return result[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  // async readSignature() {
  //   try {
  //     const { combined } = await $(this.buildBaseCommand());
  //     if (combined.includes("Yikes!  Invalid device signature")) {
  //       throw new Error("Invalid device signature");
  //     }
  //     const result = combined.match(
  //       /(avrdude:\sDevice\ssignature\s=\s)(?<signature>.*)/
  //     );
  //     if (!result) {
  //       throw new Error("Invalid device signature");
  //     }
  //     return result.groups.signature;
  //   } catch (error) {
  //     throw new Error("Could not find or parse device signature");
  //   }
  // }
}

async function listSerialPorts() {
  const ports = await SerialPort.list();
  const comPorts = ports
    .filter((port) => port.manufacturer)
    .map((port) => port.path);
  return comPorts;
}

module.exports = {
  ESP,
  listSerialPorts,
};
