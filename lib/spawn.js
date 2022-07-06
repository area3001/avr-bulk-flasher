const { spawn } = require("child_process");

function printStdout(txt) {
  process.stdout.write(txt);
}

function $(process, params = []) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let combined = "";

    let [realProcess, ...realParams] = process.split(" ");
    realParams = [...realParams, ...params];

    console.log(`Running: ${realProcess} ${realParams.join(" ")}`);
    const avrdude = spawn(realProcess, realParams);

    avrdude.stdout.on("data", (data) => {
      const txt = data.toString();
      printStdout(txt);
      stdout += txt;
      combined += txt;
    });

    avrdude.stderr.on("data", (data) => {
      const txt = data.toString();
      printStdout(txt);
      stderr += txt;
      combined += txt;
    });

    avrdude.on("close", (code) => {
      console.log(`child process close all stdio with code ${code}`);
      resolve({ code, stdout, stderr, combined });
    });

    avrdude.on("error", (error) => {
      console.error(`child process error: ${error}`);
      reject({ error, stdout, stderr, combined });
    });

    avrdude.on("exit", (code) => {
      console.log(`child process exited with code ${code}`);
      resolve({ code, stdout, stderr, combined });
    });
  });
}

module.exports = {
  $,
};
