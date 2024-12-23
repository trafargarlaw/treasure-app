import { ipcMain, app, BrowserWindow, safeStorage } from "electron";
import fs from "fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function storeToken(token) {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.error("Storage encryption is not available");
      return false;
    }
    const encryptedToken = safeStorage.encryptString(token);
    const tokenPath = path.join(app.getPath("userData"), "auth-token");
    fs.writeFileSync(tokenPath, encryptedToken);
    return true;
  } catch (error) {
    console.error("Failed to store token:", error);
    return false;
  }
}
function getToken() {
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
ipcMain.handle("store-token", async (_, token) => {
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
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      devTools: true,
      nodeIntegration: true
    },
    width: 440,
    height: 680,
    alwaysOnTop: true
  });
  win.setAlwaysOnTop(true, "screen-saver");
  win.webContents.openDevTools();
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
