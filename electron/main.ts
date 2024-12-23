import { app, BrowserWindow, ipcMain, safeStorage } from "electron";
import fs from "fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");

export const RENDERER_DIST = app.isPackaged
  ? path.join(process.resourcesPath, "app.asar/dist") // Updated path for production
  : path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

// Update token functions to handle errors properly
function storeToken(token: string): boolean {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.error("Storage encryption is not available");
      return false;
    }
    const encryptedToken = safeStorage.encryptString(token);
    // Store in electron's userData instead of localStorage
    const tokenPath = path.join(app.getPath("userData"), "auth-token");
    fs.writeFileSync(tokenPath, encryptedToken);
    return true;
  } catch (error) {
    console.error("Failed to store token:", error);
    return false;
  }
}

function getToken(): string | null {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.error("Storage encryption is not available");
      return null;
    }
    const tokenPath = path.join(app.getPath("userData"), "auth-token");
    if (!fs.existsSync(tokenPath)) {
      return null;
    }
    const encryptedToken = fs.readFileSync(tokenPath);
    return safeStorage.decryptString(encryptedToken);
  } catch (error) {
    console.error("Failed to retrieve token:", error);
    return null;
  }
}

// Add these lines before app.whenReady()
// IPC handlers for token management
ipcMain.handle("store-token", async (_, token: string) => {
  return storeToken(token);
});

ipcMain.handle("get-token", async () => {
  return getToken();
});

ipcMain.handle("delete-token", async () => {
  try {
    const tokenPath = path.join(app.getPath("userData"), "auth-token");
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
    }
    return true;
  } catch (error) {
    console.error("Failed to delete token:", error);
    return false;
  }
});

function createWindow() {
  win = new BrowserWindow({
    icon: app.isPackaged
      ? path.join(process.resourcesPath, "app.asar/dist", "icon.png") // Updated icon path
      : path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
    },
    width: 320,
    height: 680,
    alwaysOnTop: true,
    maxHeight: 800,
  });
  win.setAlwaysOnTop(true, "screen-saver");

  win.webContents.openDevTools();

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const finalPath = path.join(RENDERER_DIST, "index.html");

    win.loadFile(finalPath);
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
