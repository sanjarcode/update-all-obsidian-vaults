const util = require("util");
const promisifiedExec = util.promisify(require("child_process").exec);

async function runCommand(command) {
  let retVal;
  try {
    const { stdout, stderr } = await promisifiedExec(command);
    retVal = [stderr || null, stdout];
  } catch (e) {
    retVal = [{ code: e.code, message: e.message }, e.stdout];
  }

  return retVal;
}

// Examples
runCommand.ExampleSuccess = async () => {
  const [error, output] = await runCommand("ls");
  console.log('ExampleSuccess: "ls", result:');
  console.log({ error, output }, "\n");
  return [error, output];
};

runCommand.ExampleFailure = async () => {
  const [error, output] = await runCommand("lsx");
  console.log('ExampleFailure: "lsx", result:');
  console.log({ error, output }, "\n");
  return [error, output];
};

if (require.main === module) {
  runCommand.ExampleSuccess();
  runCommand.ExampleFailure();
}

module.exports = runCommand;
