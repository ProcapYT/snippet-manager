const { ipcRenderer } = require("electron");
const fs = require("node:fs/promises");
const { join } = require("node:path");

const $snippetEditor = document.querySelector(".snippetEditor");
const $filesContainer = document.querySelector(".filesContainer");
const $createFileButton = document.querySelector(".createFileButton");
const $createFileForm = document.querySelector(".createFileForm");
const $createFileInput = document.querySelector(".createFileInput");

import { getIcon } from "./getIcon.js";
import { getLang } from "./getLang.js";

const loader = require("monaco-loader");
const monaco = await loader();

let currentEditor = null;
let currentFile = null;
let currentFolder = null;

function createEditor(fileContent, fileExtension) {
  const language = getLang(fileExtension);

  if ($snippetEditor.classList.contains("hidden"))
    $snippetEditor.classList.remove("hidden");
  if (currentEditor !== null) currentEditor.dispose();

  currentEditor = monaco.editor.create($snippetEditor, {
    language: language,
    value: fileContent,
    automaticLayout: true,
    theme: "vs-dark",
    tabSize: 2,
    cursorStyle: "line",
    cursorBlinking: "expand",
    fontFamily: "CascadiaCode",
    fontLigatures: true,
  });

  currentEditor.onDidChangeModelContent(resetSaveTimeout);
}

let saveTimeout;

function resetSaveTimeout() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (currentEditor !== null) {
      saveCode(currentFile, currentEditor.getValue());
    }
  }, 100);
}

async function readFolder(folderPath) {
  currentFolder = folderPath;

  $filesContainer.innerHTML = "";

  const folderFiles = await fs.readdir(folderPath);

  for (const file of folderFiles) {
    const filePath = join(folderPath, file);
    const fileExtension = file.substring(file.lastIndexOf(".") + 1);

    const $fileButton = document.createElement("button");
    const $fileNamePar = document.createElement("p");
    const $fileIcon = document.createElement("img");
    const $deleteFileButton = document.createElement("button");
    const $deleteFileIcon = document.createElement("i");

    $fileButton.classList.add("fileButton");
    $fileNamePar.classList.add("fileNamePar");
    $fileIcon.classList.add("fileIcon");

    $deleteFileButton.classList.add("deleteFileButton");
    $deleteFileIcon.classList.add("fa-solid", "fa-trash-can");

    $fileIcon.style = "width: 20px; aspect-ratio: 1 / 1;";
    $fileIcon.src = getIcon(fileExtension);

    $deleteFileButton.appendChild($deleteFileIcon);

    $fileNamePar.appendChild($fileIcon);
    $fileNamePar.appendChild(document.createTextNode(file));
    $fileButton.appendChild($fileNamePar);
    $fileButton.appendChild($deleteFileButton);
    $filesContainer.appendChild($fileButton);

    $fileButton.addEventListener("click", async () => {
      const fileContent = await fs.readFile(filePath, {
        encoding: "utf8",
      });

      createEditor(fileContent, fileExtension);

      currentFile = filePath;
    });

    $deleteFileButton.addEventListener("click", async (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();

      await fs.rm(filePath);

      if (currentFile === filePath) {
        currentEditor.dispose();
        currentEditor = null;

        currentFile = null;
      }

      await readFolder(currentFolder);
    });
  }
}

$createFileButton.addEventListener("click", () => {
  $createFileForm.classList.remove("hidden");

  $createFileInput.focus();
});

$createFileInput.addEventListener("blur", () => {
  $createFileForm.classList.add("hidden");
});

$createFileForm.addEventListener("submit", async (e) => {
  const folderFiles = await fs.readdir(currentFolder);

  if (
    !folderFiles.includes($createFileInput.value) &&
    $createFileInput.value !== ""
  ) {
    await fs.writeFile(join(currentFolder, $createFileInput.value), "", {
      encoding: "utf8",
    });

    await readFolder(currentFolder);

    $createFileInput.blur();
  }

  e.preventDefault();
});

async function saveCode(filePath, fileContent) {
  await fs.writeFile(filePath, fileContent);
}

ipcRenderer.on("snippetsFolderPath", async (event, folderPath) => {
  await readFolder(folderPath);
});

ipcRenderer.send("rendered");
