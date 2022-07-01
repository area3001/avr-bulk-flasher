const { spawn } = require("child_process");

function $(process, params = []) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let combined = "";

    const [realProcess, ...realParams] = process.split(" ");

    console.log(`Running: ${realProcess} ${realParams.join(" ")}`);
    const avrdude = spawn(realProcess, [...realParams, ...params]);

    avrdude.stdout.on("data", (data) => {
      const txt = data.toString();
      console.log(txt);
      stdout += txt;
      combined += txt;
    });

    avrdude.stderr.on("data", (data) => {
      const txt = data.toString();
      console.error(txt);
      stderr += txt;
      combined += txt;
    });

    avrdude.on("close", (code) => {
      console.log(`child process close all stdio with code ${code}`);
      resolve({ code, stdout, stderr, combined });
    });

    avrdude.on("error", (error) => {
      console.log(`child process error: ${error}`);
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
