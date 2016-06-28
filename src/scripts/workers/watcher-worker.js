const Events = require('events');
const eventEmitter = new Events();
// require watcher
const chokidar = require('chokidar');

const uncProcessed = require('./../utils/unc-processed');
const monitorWorker = require('./monitor-worker');
const tasksController = require('./../controllers/tasks-controller');
class WatcherWorker {

  constructor() {
    this.taskList = [];
    this.done = data => {
      eventEmitter.emit('done', data);
    };
    monitorWorker.on('done', e => {
      if (!this.max) {
        this.max = monitorWorker.jobList.length;
      } else if (monitorWorker.jobList.length > this.max) {
        this.max = monitorWorker.jobList.length;
      }
      if (!this.jobCalls) {
        this.jobCalls = 0;
      }
      this.jobCalls += 1;
      uncProcessed.addProcessedItem(e.opt.path);
      eventEmitter.emit('progress-update', {
        target: e.opt.ruleName,
        total: this.max,
        done: this.jobCalls
      });
    });
  }

  get isBusy() {
    return this.busy;
  }

  on(eventName, cb) {
    eventEmitter.on(eventName, data => {
      cb(data);
    });
  }

  run(o) {
    var _task = o.task;
    var watcher = chokidar.watch(_task.folder.path, {
      ignored: /[\/\\]\./,
      depth: _task.options.folderDepth
    });
    watcher._task = _task;
    watcher.add(_task.folder.path);
    this._initWatcher(watcher);
  }

  _initWatcher(watcher) {
    var task = watcher._task;
    task.running = true;
    tasksController.updateTask(task.name, task);
    watcher.on('add', path => {
      uncProcessed.isProcessed({task: task, path: path})
      .then(() => {
        return;
      })
      .catch(o => {
        monitorWorker.addJob({task: o.task, path: o.path});
      });
    });
  }
}
module.exports = new WatcherWorker();
