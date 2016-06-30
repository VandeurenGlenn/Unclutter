var Application = require('spectron').Application;
var assert = require('assert');

describe('application launch', function() {
  this.timeout(0);

  beforeEach(function() {
    this.app = new Application({
      path: 'dist/win-unpacked/UnClutter.exe'
    });
    return this.app.start();
  });

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      this.app.stop();
    }
  });

  it('checks if there is an window', function(done) {
    this.app.client.waitUntilWindowLoaded();
    this.app.client.getWindowCount().then(count => {
      assert.equal(count, 1);
      done();
    });
  });
});
