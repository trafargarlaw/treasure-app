export function isAuthenticated() {
  const token = window.ipcRenderer.getToken();
  return token;
}
