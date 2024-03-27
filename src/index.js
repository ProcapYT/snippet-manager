const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const { join } = require("node:path");

const {
  createSnippetsDir,
  snippetFolderPath,
  existsDir,
} = require("./createSnippetsDir.js");

let mainWindow;

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    icon: join(__dirname, "..", "assets", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.maximize();
  mainWindow.loadFile(join(__dirname, "..", "render", "index.html"));

  if (!app.isPackaged) {
    mainWindow.openDevTools();
  }

  Menu.setApplicationMenu(null);

  await createSnippetsDir();
}

app.on("ready", async () => {
  await createMainWindow();
});

ipcMain.on("rendered", (event) => {
  const createdSnippetsPromise = new Promise((resolve) => {
    const createdSnippetsInterval = setInterval(async () => {
      if (await existsDir(snippetFolderPath)) {
        resolve();
        clearInterval(createdSnippetsInterval);
      }
    }, 100);
  });

  createdSnippetsPromise.then(() => {
    event.reply("snippetsFolderPath", snippetFolderPath);
  });
});
