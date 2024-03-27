const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const { join } = require("node:path");

const {
  createSnippetsDir,
  snippetFolderPath,
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
  event.reply("snippetsFolderPath", snippetFolderPath);
});
