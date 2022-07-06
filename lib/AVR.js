const { $ } = require("./spawn");
const SerialPort = require("serialport").SerialPort;

class AVR {
  constructor(options = {}) {
    const { port, baudrate, device, programmer } = options;
    if (!port) {
      throw new Error("No port specified");
    }
    this.port = port;
    this.baudrate = baudrate || 19200;
    this.device = device || "atmega328p";
    this.programmer = programmer || "stk500v1"; // or arduino
  }

  buildBaseCommand() {
    const { port, baudrate, device, programmer } = this;
    return `avrdude -p ${device} -c ${programmer} -P ${port} -b ${baudrate}`;
  }

  async writeFuses() {
    return await $(this.buildBaseCommand(), [
      "-U",
      "lfuse:w:0xFF:m",
      "-U",
      "hfuse:w:0xDE:m",
    ]);
  }

  async flash(file) {
    return await $(this.buildBaseCommand(), ["-U", `flash:w:${file}:i`]);
  }

  async readSignature() {
    try {
      const { combined } = await $(this.buildBaseCommand());
      if (combined.includes("Yikes!  Invalid device signature")) {
        throw new Error("Invalid device signature");
      }
      const { signature } = combined.match(
        /(avrdude:\sDevice\ssignature\s=\s)(?<signature>.*)/
      ).groups;
      return signature;
    } catch (error) {
      console.error(error);
      throw new Error("Could not find or parse device signature");
    }
  }
}

async function listSerialPorts() {
  const ports = await SerialPort.list();
  const comPorts = ports
    .filter((port) => port.manufacturer)
    .map((port) => port.path);
  return comPorts;
}

module.exports = {
  AVR,
  listSerialPorts,
};
