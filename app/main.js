'use strict';
const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const watcherWorker = require('./scripts/workers/watcher-worker');

const fs = require('fs');
const {ipcMain} = require('electron');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let options = JSON.parse(fs.readFileSync(`${__dirname}/../user-settings.json`)).options;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, frame: false});

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
/* Single Instance Check */
var multipleInstances = app.makeSingleInstance(function() {
  if (mainWindow) {
    return true;
  }
  return false;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  if (!multipleInstances) {
    app.setName('UnClutter');
    ipcMain.on('setup-new-watcher', (event, arg) => {
      let sender = event.sender;
      watcherWorker.on('progress-update', data => {
        sender.send('progress-update', data);
      });
      watcherWorker.run(JSON.parse(arg.toString()));
    });
    var tray = require('./os-integration/tray.js');
    tray.on('open-window', () => {
      if (!mainWindow) {
        createWindow();
      }
    });

    tray.on('close-window', () => {
      if (mainWindow) {
        mainWindow.close();
      }
    });

    tray.on('quit-app', () => {
      app.quit();
    });

    require('./scripts/workers/task-worker.js');
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin' && !options.runInBackground) {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// require('./server.js');
