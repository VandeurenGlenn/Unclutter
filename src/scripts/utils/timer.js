'use-strict';
(function() {
  class Timer {
    constructor() {
      this.time = 0;
    }
    start() {
      this.interval = setInterval(() => {
        this.time += 1;
      }, 1000);
    }

    stop() {
      clearInterval(this.interval);
    }
  }

  module.exports = new Timer();
})();
