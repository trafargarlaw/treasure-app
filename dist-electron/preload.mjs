"use strict";const n=require("electron");n.contextBridge.exposeInMainWorld("ipcRenderer",{on(...e){const[r,o]=e;return n.ipcRenderer.on(r,(t,...i)=>o(t,...i))},off(...e){const[r,...o]=e;return n.ipcRenderer.off(r,...o)},send(...e){const[r,...o]=e;return n.ipcRenderer.send(r,...o)},invoke(...e){const[r,...o]=e;return n.ipcRenderer.invoke(r,...o)},storeToken:e=>n.ipcRenderer.invoke("store-token",e),getToken:()=>n.ipcRenderer.invoke("get-token"),deleteToken:()=>n.ipcRenderer.invoke("delete-token")});
