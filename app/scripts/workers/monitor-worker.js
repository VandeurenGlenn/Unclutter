const Events = require('events');
const eventEmitter = new Events();
class MonitorWorker {

  constructor() {
    this.busy = false;
    this.done = data => {
      eventEmitter.emit('done', data.value);
      this.busy = false;
      this.jobList.splice(0, 1);
      if (this.jobList.length) {
        this._run(this.jobList[0]);
      }
    };
  }

  get isBusy() {
    return this.busy;
  }

  get jobList() {
    if (this._jobList) {
      return this._jobList;
    }
    return [];
  }

  set jobList(val) {
    if (this._jobList !== val) {
      this._jobList = val;
      this._run();
    }
    // console.log(val);
  }

  on(eventName, cb) {
    eventEmitter.on(eventName, data => {
      cb(data);
    });
  }

  addJob(job) {
    var jobs = this.jobList;
    jobs.push(job);
    if (this.timout) {
      clearTimeout(this.delay);
    } else {
      this.timout = () => {
        setTimeout(() => {
          this.jobList = jobs;
        }, 500);
      };
    }
    this.timout();
  }

  _run() {
    if (this.busy && this.jobList.length) {
      setTimeout(function() {
        this._run(this.jobList[0]);
      }, 50);
    } else if (this.jobList && this.jobList.length) {
      this.run(this.jobList[0]);
    }
  }

  run(data) {
    this.busy = true;
    const workers = require('electron-workers')({
      connectionMode: 'ipc',
      pathToScript: `${__dirname}/../../main.js`,
      timeout: 5000,
      numberOfWorkers: 1
    });
    workers.start(startErr => {
      if (startErr) {
        return console.error(startErr);
      }
      workers.execute({
        workerEvent: 'task',
        eventName: 'run',
        data: data
      }, (err, data) => {
        if (err) {
          return console.error(err);
        }
        workers.kill();
        this.done(data);
      });
    });
  }
}
module.exports = new MonitorWorker();
