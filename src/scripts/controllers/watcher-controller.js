'use-strict';
// const eventEmitter = new Events();
const {ipcRenderer} = require('electron');
const eventEmitter = require('events');
class WatcherController {
  on(eventName, cb) {
    eventEmitter.on(eventName, data => {
      cb(data);
    });
  }

  emit(eventName, data) {
    ipcRenderer.on('progress-update', (event, progress) => {
      if (window.app.pageActive('monitor')) {
        window.app.monitorPage.updateProgressFor(progress.target, progress);
      }
      window.app.app.progressElement.update(progress.target, progress);
    });
    ipcRenderer.send('setup-new-watcher', data);
  }
}
module.exports = new WatcherController();
