'use-strict';
const fs = require('fs');

class UnIndex {

  constructor() {
    this.index = this.getIndexFor('index');
  }

  getIndexFor(name) {
    try {
      return JSON.parse(fs.readFileSync(`${name}.json`));
    } catch (err) {
      return this[name] || [];
    }
  }

  contains(arr, item) {
    return new Promise(resolve => {
      if (arr.indexOf(item) > -1) {
        // opt.result = true;
        resolve(true);
      } else {
        // opt.result = false;
        resolve(false);
      }
    });
  }

  // contains(opt) {
  //   return new Promise(resolve => {
  //     if (this.index.indexOf(opt.path) > -1) {
  //       opt.result = true;
  //       resolve(opt);
  //     } else {
  //       opt.result = false;
  //       resolve(opt);
  //     }
  //   });
  // }

  add(opt) {
    if (!opt.target) {
      opt.target = 'index';
    }
    this[opt.target].push(opt.item);
    this._updateIndexFor(opt.target);
  }

  _updateIndexFor(target) {
    if (this.isWriting) {
      setTimeout(() => {
        return this._updateIndexFor(target);
      }, 200);
    } else {
      this.isWriting = true;
      fs.writeFile(`${target}.json`, JSON.stringify(this[target], null, 2), (err, result) => {
        if (err) {
          console.log(err);
        }
        this.isWriting = false;
      });
    }
  }
}

class UncProcessed extends UnIndex {
  constructor() {
    super();
    this.processed = this.getIndexFor('processed');
  }

  addProcessedItem(item) {
    this.add({target: 'processed', item: item});
  }

  /**
   * @arg {object} opt
   * @return Promise: resolve when item is processed, rejects when nothing is there ...
   */
  isProcessed(opt) {
    return new Promise((resolve, reject) => {
      this.contains(this.index, opt.path).then(exists => {
        if (exists) {
          this.contains(this.processed, opt.path).then(exists => {
            if (exists) {
              resolve(`${opt.path} already processed`);
            } else {
              reject(opt);
            }
          });
        } else {
          this.add(opt.path);
          reject(opt);
        }
      });
    });
  }
}

// module.exports = new UncProcessed();

module.exports = new UncProcessed();
