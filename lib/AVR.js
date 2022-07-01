const { $ } = require("./spawn");
const SerialPort = require("serialport").SerialPort;

class AVR {
  constructor(options) {
    const { port, baudrate, device, programmer } = options;
    this.port = port;
    this.baudrate = baudrate || 19200;
    this.device = device || "m328p";
    this.programmer = programmer || "arduino"; // or stk500v1
  }

  buildBaseCommand() {
    const { port, baudrate, device, programmer } = this;
    return `avrdude -p ${device} -c ${programmer} -P ${port} -b ${baudrate}`;
  }

  async flash(hex) {
    return await $(this.buildBaseCommand(), [hex]);
  }

  async readSignature() {
    try {
      const { combined } = await $(this.buildBaseCommand());
      const { signature } = combined.match(
        /(avrdude:\sDevice\ssignature\s=\s)(?<signature>.*)/
      ).groups;
      return signature;
    } catch (error) {
      console.error(error);
      console.error("Could not find or parse device signature");
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
