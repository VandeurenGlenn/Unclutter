'use-strict';
var fs = require('fs');

class TasksController {
  constructor() {
    try {
      this._tasks = JSON.parse(fs.readFileSync('tasks.json'));
    } catch (e) {
      this._tasks = [];
    }
  }

  static get tasks() {
    return this.tasks;
  }

  get tasks() {
    return this._tasks;
  }

  write(data) {
    fs.writeFileSync('tasks.json', JSON.stringify(data, null, 2));
  }

  updateTasks(task) {
    if (!task) {
      return this.isUndefined('updateTasks', [{
        task: task
      }]);
    }
    this.tasks.push(task);
    this.write(this.tasks);
  }

  /**
   * @arg {string} func the function that called
   * @arg {array} arr an Array containing items to check
   */
  isUndefined(func, arr) {
    try {
      arr.forEach(item => {
        for (let key of item) {
          if (!item[key] || item[key] === null) {
            console.error(`${func}::${key} = ${item[key] || undefined}`);
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  updateTask(name, value) {
    if (!name || !value || !this.tasks) {
      return this.isUndefined('updateTask', [{
        name: name
      }, {
        value: value
      }, {
        tasks: this.tasks
      }]);
    }
    this.tasks.forEach((task, index) => {
      if (task.name === name) {
        this.tasks[index] = value;
        this.write(this.tasks);
      }
    });
  }
}
module.exports = new TasksController();
