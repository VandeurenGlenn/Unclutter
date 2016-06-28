'use-strict';

class ProgressWorker {
  constructor() {
    this.ipcRender = require('electron').ipcRenderer;
  }

  send() {
    this.ipcRender.send('ping', 'whooooh');
  }
}

module.exports = new ProgressWorker();
