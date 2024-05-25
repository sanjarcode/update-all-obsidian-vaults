const process = require("node:process");
const path = require("node:path");
const os = require("node:os");

const TEMPLATE_VAULT_PATH = path.join(
  os.homedir(),
  "home_files/git_dir/template-sanjar-notes" // just edit this quote string part
);

const PLATFORMS = {
  WINDOWS: "win32",
  LINUX: "linux",
  MACOS: "darwin",
};

const VAULTS_FILE_PATH = {
  [PLATFORMS.WINDOWS]: "",
  [PLATFORMS.LINUX]: "",
  [PLATFORMS.MACOS]: path.join(
    os.homedir(),
    "Library/Application Support/obsidian/obsidian.json"
  ),
};

/**
 *
 * @returns {Array<Object>} [{path, id, ...}]
 */
const getVaults = () => {
  const vaultFileContent = require(VAULTS_FILE_PATH[process.platform]);
  return Object.entries(vaultFileContent?.vaults ?? {}).map(([k, v]) => ({
    ...v,
    id: k,
  }));
};

module.exports = { getVaults, TEMPLATE_VAULT_PATH };
