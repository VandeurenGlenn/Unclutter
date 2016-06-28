var monitor = require('./../monitor');
var tasksController = require('./tasks-controller');
// const watcherWorker = require('./../workers/watcher-worker');

class AppController extends HTMLElement {
  createdCallback() {
    this._setupResizeListener(window, this._fireResize.bind(this));
    this.selected = this.selected || 'dashboard';
    this.progressInstances = [];
    // requestIdleCallback(() => {
    monitor.tasks = tasksController.tasks;

    // monitor.on('setup-new-watcher', (watcher, data) => {
    //   watcherWorker.run(watcher, data);
    // });
    // monitor.on('progress-update', (target, data) => {
    //   if (this.pageActive('monitor')) {
    //     this.monitorPage.updateProgressFor(target, data);
    //   }
    //   this.app.progressElement.update(target, data);
    // });
    monitor.start();
    // });
  }

  updateTask(name, task) {
    tasksController.updateTask(name, task);
    // monitor.tasks = newVal;
  }

  updateTasks(task) {
    tasksController.updateTasks(task);
    // monitor.tasks = newVal;
  }

  get app() {
    return Polymer.dom(document).querySelector('un-app');
  }

  static get app() {
    return Polymer.dom(document).querySelector('un-app');
  }

  get tasks() {
    return tasksController.tasks;
  }

  static get tasks() {
    return this.tasks;
  }

  get pagesElement() {
    return this.app.root.querySelector('un-pages');
  }

  get monitorPage() {
    return this.pagesElement.shadowRoot.querySelector('monitor-page');
  }

  set selected(value) {
    this.go(value);
  }

  pageActive(page) {
    if (page === this.pagesElement.selected) {
      return true;
    }
    return false;
  }

  _setupResizeListener(target, fn) {
    target.addEventListener('resize', fn);
  }

  _fireResize() {
    // requestAnimationFrame(() => {
    var width = window.outerWidth;
    var height = window.outerHeight;
    var _detail = {
      width: width,
      height: height
    };
    document.dispatchEvent(new CustomEvent('app-resize', {detail: _detail}));
    // });
  }

  promiseLazyLoad(page) {
    return new Promise(function(resolve, reject) {
      var url = `./pages/${page}-page.html`;
      const link = document.createElement('link');
      link.rel = 'import';
      link.href = url;
      link.onload = function() {
        resolve(page);
      };
      Polymer.dom(document).querySelector('head').appendChild(link);
    });
  }

  go(page) {
    // this.animating = true
    Polymer.RenderStatus.afterNextRender(this, function() {
      this.promiseLazyLoad(page).then(function(page) {
        this._fireResize();
        this.pagesElement.selected = page;
        // this.animating = false
      }.bind(this));
    });
  }

  routeItemClick(event) {
    this.selected = Polymer.dom(event).rootTarget.getAttribute('name');
    // window.location.href = `file://${__dirname}/folders.html`;
  }
}

document.registerElement('app-controller', AppController);
