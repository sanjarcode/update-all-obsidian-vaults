// const { simpleGit } = require("simple-git");
const { TEMPLATE_VAULT_PATH, getVaults } = require("./constants");
const path = require("path");
const runCommand = require("./terminal");
const { error } = require("console");

/**
 * @returns {Array<String>}
 * Example output:
 *
[
  '.obsidian/app.json',
  '.obsidian/community-plugins.json',
  '.obsidian/hotkeys.json',
  '.obsidian/plugins/obsidian-sequence-hotkeys/data.json',
  '.obsidian/plugins/obsidian-sequence-hotkeys/main.js',
  '.obsidian/plugins/obsidian-sequence-hotkeys/manifest.json'
]
 */
const getLatestChangedFiles = async () => {
  const [_, response] = await runCommand(
    `cd ${TEMPLATE_VAULT_PATH}; git log --grep='Update prefs' --max-count 1 --name-only`
  );

  const latestCommit = response
    .split("\n")
    .at(0)
    .split("commit ")
    .at(-1)
    .replaceAll("n")
    .slice(0, 7);

  const files = response
    .split("\n")
    .filter((filePath) => filePath && filePath.startsWith(".obsidian/"))
    .map((filePath) => filePath.replace("\n", ""));

  console.log(files);
  return { files, latestCommit };
};

// Creates, Updates, deletes file as per change
const updateFilesToVaults = async () => {
  const vaults = getVaults();
  const { files: filesPathsToCopy, latestCommit } =
    await getLatestChangedFiles();

  for (let vault of vaults) {
    try {
      const { path: vaultPath } = vault;
      const vaultName = vaultPath.split("/").at(-1);

      // Check staging area
      const isStagingAreaClear = !(
        await runCommand(`cd ${vaultPath}; git status;`)
      )[1].includes("Changes to be committed");

      if (!isStagingAreaClear) {
        throw new Error(
          `Vault ${vaultName} has uncommitted changes, aborting changes for it. Path: ${vaultPath}`
        );
      }

      // copy or delete each file, create layers if needed.
      // do git add
      for (const filePath of filesPathsToCopy) {
        const fileToCopyAbsolutePath = path.join(TEMPLATE_VAULT_PATH, filePath);
        const dirTreePath = path
          .dirname(fileToCopyAbsolutePath)
          .replaceAll(`${TEMPLATE_VAULT_PATH}/`, "");

        const [err] = await runCommand(
          `cd ${TEMPLATE_VAULT_PATH}; ls ${fileToCopyAbsolutePath}`
        );
        const isFileDeleted = err?.code === 1;

        console.log(
          await runCommand(`cd ${vaultPath}; git checkout ${filePath};`)
        );
        const fileCommand = isFileDeleted
          ? `git rm ${filePath}`
          : `mkdir -p ${dirTreePath}; cp -r ${fileToCopyAbsolutePath} ${filePath}`;
        console.log(await runCommand(`cd ${vaultPath}; ${fileCommand};`));
        console.log(await runCommand(`cd ${vaultPath}; git add ${filePath};`));
      }

      // Commit
      //   await runCommand(
      //     `cd ${vaultPath}; git commit -m "Update prefs using template repo commit ${latestCommit}"`
      //   );
      // All files done, so print success message
      console.log(`Successfully updated vault ${vaultName}`);
    } catch (e) {
      console.log(e);
    }
  }
};

async function main() {
  try {
    await updateFilesToVaults();
  } catch (e) {
    console.log(e);
  }
}

main();
