const exec = require("child_process").exec;
const fs = require("fs");
const transform = require("babel-core").transform;
const chalk = require("chalk");

module.exports = function(dirPath, filePath, commands) {

  if (commands.build) {
    commands.build = `cd ${dirPath} && ${commands.build}`;
  }
  commands.test = `cd ${dirPath} && ${commands.test}`;

  console.log(chalk.green("1.", commands.build || "Nothing to build"));

  if (commands.build) {
    const buildProcess = exec(commands.build, (err) => {
      if (err) {
        console.error(`Error building: ${err}`);
        return;
      }
      minify();
    });

    buildProcess.stdout.pipe(process.stdout);
  }
  else {
    minify();
  }

  function minify() {
    fs.readFile(`${dirPath}/${filePath}`, (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err}`);
        return;
      }

      console.log(chalk.green("2. Minifying", filePath));

      const { code: minified } = transform(data.toString(), {
        comments: false,
        minified: true,
        passPerPreset: true,
        presets: ["babili"],
      });

      fs.writeFile(`${dirPath}/${filePath}`, minified, (err) => {
        if (err) {
          console.error(`Error writing file: ${err}`);
          return;
        }

        console.log(chalk.green("3.", commands.test));
        const testProcess = exec(commands.test, (err, stdout) => {
          if (err) {
            console.error(`Error testing: ${err}`);
            return;
          }
          console.log(stdout);
          process.exit(0);
        });

        testProcess.stdout.pipe(process.stdout);
      });
    });
  }
};
