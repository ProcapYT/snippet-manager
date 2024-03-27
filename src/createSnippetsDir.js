const { join, sep } = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");

const desktopPath = join(os.homedir(), "Desktop");
const snippetFolderPath = join(desktopPath, "snippets");

const readmeContent = `Wellcome to the SNIPPET MANAGER made by Samuel Pedrera
You can find the source code in my gthub https://github.com/ProcapYT/snippet-manager

You can create a file by clicking the button in the up right corner
Delete a file by clicking the trash can icon near the file you want to delete
Open the file editor by clicking the file you want to edit
The code saves automaticly after 100 miliseconds without editing the file

I made this editor for a chalenge that I gave to myself

I hope this is usefull for you

You can delete this file btw
`;

async function existsDir(dirPath) {
  const pathNoDir = dirPath.substring(0, dirPath.lastIndexOf(sep));
  const dir = dirPath.substring(dirPath.lastIndexOf(sep) + 1);

  const dirFiles = await fs.readdir(pathNoDir);

  return dirFiles.includes(dir) ? true : false;
}

async function createSnippetsDir() {
  if (!(await existsDir(snippetFolderPath))) {
    await fs.mkdir(snippetFolderPath);
    await fs.writeFile(join(snippetFolderPath, "README.md"), readmeContent, {
      encoding: "utf8",
    });
  }
}

module.exports = { createSnippetsDir, snippetFolderPath };
