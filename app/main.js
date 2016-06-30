'use strict';
// Module to control application life,
// create native browser window &
// send message over ipc
const {app, BrowserWindow, ipcMain} = require('electron');
require('./squirrel-startup-handler').on('quit-app', () => {
  app.quit();
});
// Module to read a file
const {readFile} = require('./scripts/utils/util.js');
// Module for running watchers
const watcherWorker = require('./scripts/workers/watcher-worker');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
// Create a global for the sender for ipcMain & watcherWorker
let sender;
// Create a global for the user its options
let options = readFile(`${__dirname}/user-settings.json`).options;

/**
 * creates a new BrowserWindow
 */
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, frame: false});

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);
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

if (!multipleInstances) {
  ipcMain.on('setup-new-watcher', (event, arg) => {
    sender = event.sender;
    watcherWorker.run(JSON.parse(arg.toString()));
  });
  watcherWorker.on('progress-update', data => {
    if (mainWindow) {
      sender.send('progress-update', data);
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  if (!multipleInstances) {
    app.setName('UnClutter');
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
  }

  require('./scripts/workers/task-worker.js');
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
