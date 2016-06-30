'use-strict';
const {readFile, readFileSync} = require('fs');
class Util {
  readFile(sync, url) {
    if (typeof sync === 'boolean' && sync) {
      return JSON.parse(readFileSync(url));
    } else if (typeof sync === 'boolean') {
      readFile(url, (err, file) => {
        if (err) {
          return console.error(err);
        }
        return JSON.parse(file);
      });
    } else {
      url = sync;
      return JSON.parse(readFileSync(url));
    }
  }
}
module.exports = new Util();
