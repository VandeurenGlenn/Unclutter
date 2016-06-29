'use-strict';
const fs = require('fs');
// require & setup compressing modules
const zlib = require('zlib');

const del = require('del');
const watcherController = require('./controllers/watcher-controller');

const EventEmitter = require('events');

// class EventEmitter extends Events {}
// const monitorWorker = new MonitorWorker();
// var paths = [];
// var isReady = true;
class FolderController extends EventEmitter {

  _removeExtension(str) {
    var pIndex;
    while (str.lastIndexOf('.') > 0) {
      pIndex = str.lastIndexOf('.');
      // check if character before extension
      var ch = str.slice(pIndex - 1, pIndex);
      if (ch.match(/\D/)) {
        str = str.slice(0, pIndex);
      } else {
        return str;
      }
    }
    return str;
  }

  _getFileNameFromPath(str, opt) {
    str = str.replace(/(.*)\\/g, '');
    if (opt && opt['remove-extension']) {
      str = this._removeExtension(str);
    }
    return str;
  }

  ensuredir(_dir, _opt) {
    return new Promise((resolve, reject) => {
      var dir = _dir;
      var opt = _opt;
      fs.readdir(dir, err => {
        if (err) {
          this._errorHandler(err, 'ensuredir');
          fs.mkdir(dir, err => {
            if (err) {
              reject(err);
            }
            resolve(opt);
          });
        } else {
          resolve(opt);
        }
      });
    });
  }
}
class TaskMethods extends FolderController {

  _runRule(_task, path, _rule, cb) {
    var _path = path;
    var task = _task;
    var rule = _rule;
    var folderPath = task.folder.path;
    var foldername = task.folder.name;
    var archive = task.options.archive;
    this.ensuredir(task.do.path, {
      taskName: task.name,
      ruleName: task._ruleName,
      do: task.do,
      path: _path,
      rule: rule,
      folderPath: folderPath,
      foldername: foldername,
      archive: archive
    }).then(opt => {
      if (opt.path.includes(`.${opt.rule.input}`)) {
        opt.filename = this._getFileNameFromPath(opt.path);
        // opt.path.replace(/(.*)\\/g, '').replace(`.${opt.rule.input}`, '');
        if (opt.do.name && opt.do.name === 'move' ||
            opt.do.name && opt.do.name === 'copy') {
          var newPath = opt.path.replace(opt.folderPath, '');
          opt.destination = opt.do.path + newPath;
          // this.ensuredir(opt.destination, opt).then(opt => {
          // requestIdleCallback(() => {

          var filename = this._removeExtension(opt.filename);
          this._promiseCopy(opt).then(opt => {
            // var filename = this._removeExtension(opt.filename);
            this._updateLog({
              task: {name: opt.foldername, file: filename},
              executed: `move ${filename} from ${opt.path} to ${opt.destination}`
            });
            // timer.stop();
          }).catch(err => {
            cb({log: 'monitor: moved ' + filename + 'from' + opt.path + 'to' + opt.destination, opt: opt});
            this._errorHandler(err.message, err.func);
          });
          cb({log: 'monitor: moved ' + filename + 'from' + opt.path + 'to' + opt.destination, opt: opt});
          // });
          // });
        }
      } else {
        cb({log: 'monitor: finished scanning ' + opt.path, opt: opt});
      }
    });
  }

  _runRules(_task, path, cb) {
    var calls = 0;
    // return new Promise(function(resolve, reject) {
    var rules = _task.rules;
    rules.forEach((rule, index) => {
      calls += 1;
      if (rule.by === 'extension') {
        // ensure a name is provided!
        _task._ruleName = rule.input || index;
        this._runRule(_task, path, rule, cb);
      }
    });
    // }.bind(this));
  }
  _promiseCopy(opt) {
    return new Promise((resolve, reject) => {
      const gzip = zlib.createGzip();
    // create Gunzip for unzipping
      const gunzip = zlib.createGunzip();
      // setTimeout(() => {
      const _in = fs.createReadStream(opt.path, {
        flags: 'r',
        encoding: null,
        fd: null,
        mode: 0o666,
        autoClose: true
      });
        // create write stream <NEW_PATH>.gz
      const _out = fs.createWriteStream(`${opt.destination}.gz`, {
        flags: 'w',
        defaultEncoding: null,
        fd: null,
        mode: 0o666,
        autoClose: true
      });
      _in.pipe(gzip)
        .pipe(_out)
        .on('finish', () => {
          console.log('done compressing');
          this._updateLog({
            task: {name: opt.foldername, file: opt.filename.replace(`.${opt.rule.input}`, '')},
            zipped: `${opt.filename} to ${opt.destination}.gz`
          });
          if (opt.archive) {
            // keep file zipped when archive is set to true
            this._promiseRemove(opt.path).then(() => {
              resolve(opt);
            });
          } else {
            // unzip the file
            var zippedIn = fs.createReadStream(`${opt.destination}.gz`);
            var zippedOut = fs.createWriteStream(opt.destination);

            zippedIn
            .pipe(gunzip)
            .pipe(zippedOut)
            .on('finish', () => {
              console.log('done un-compressing');
              this._updateLog({
                task: {name: opt.foldername, file: opt.filename.replace(`.${opt.rule.input}`, '')},
                unzipped: `${opt.filename}.gz to ${opt.destination}`
              });

              if (opt.do.name === 'move') {
                var glob = [opt.path, `${opt.destination}.gz`];
                this._promiseRemove(glob).then(log => {
                  console.log(log);
                  resolve(opt);
                });
              }
            }).on('error', err => {
              err = {
                message: err,
                func: '_promiseCopy'
              };
              reject(err);
            });
          }
        }).on('error', err => {
          err = {
            message: err,
            func: '_promiseCopy'
          };
          reject(err);
        });
      // }, 1000);
    });
  }

  _promiseRemove(path) {
    // add dryRun
    return new Promise(function(resolve) {
      del(path, {force: true}).then(paths => {
        var log = paths;
        if (paths.length > 1) {
          log = paths.join('\n');
        }
        resolve(`Deleted files and folders:
        ${log}`);
      });
    });
  }

}
class Tasks extends TaskMethods {

  _runTask(task, path, cb) {
    // const timer = require('./timer');
    // timer.start();
    // this.ensuredir('.tmp').then(() => {
    if (fs.lstatSync(path).isFile()) {
      this._runRules(task, path, cb);
    } else {
      fs.readdir(path, function(err, results) {
        if (err) {
          this._errorHandler(err, '_initWatcher');
          cb(err);
        } else if (results.inlude('.')) {
          this._runRules(task, path, cb);
        } else if (results.length) {
          results.forEach(result => {
            if (result.includes('.')) {
              this._runRules(task, path, cb);
            }
          });
        }
      });
    }
    // });
  }
}
class Monitor extends Tasks {
  constructor() {
    super();
    this.taskList = [];
  }

  _ensureIdleCallback() {
    window.requestIdleCallback =
    window.requestIdleCallback ||
    function(cb) {
      var start = Date.now();
      return setTimeout(function() {
        cb({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    };

    window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function(id) {
      clearTimeout(id);
    };
  }

  start() {
    // return new Promise((resolve, reject) => {
    // this.tasks.then(tasks => {
    if (this.tasks.length) {
      var watchers = [];
      for (var i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].options.enabled) {
            // watcherWorker.run(watchers[i], tasks[i], cb);
          var data = new Buffer(JSON.stringify({
            watcher: watchers[i],
            task: this.tasks[i]
          }));
          watcherController.emit('setup-new-watcher', data);
        }
      }
    }
  }

  _updateLog(value) {
    fs.appendFileSync('log.json', JSON.stringify(value, null, 2));
  }

  // _handleNewFolders() {
  //   document.removeEventListener('un-clutter-task-update',
  //     this._handleNewFolders.bind(this));
  // }

  _errorHandler(err, func) {
    console.log(`${func}::${err}`);
  }
}

module.exports = new Monitor();
