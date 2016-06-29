// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
require('./scripts/controllers/app-controller.js');
require('./scripts/ui/un-drawer');
require('./scripts/ui/un-pages');
require('./scripts/ui/un-button');
require('./scripts/ui/unclutter-progress');

// create global app (shared functions)
window.app = document.createElement('app-controller');

// create global method for lazy loading elements,
// returns a promise contaning an error or the import...
window.promiseLazyLoad = href => {
  return new Promise(function(resolve, reject) {
    const link = document.createElement('link');
    link.rel = 'import';
    link.href = href;
    link.onload = function(_import) {
      resolve(_import);
    };
    link.onerror = function(err) {
      reject(err);
    };
    // append on the document for shadow compatibility
    Polymer.dom(document).querySelector('head').appendChild(link);
  });
};
