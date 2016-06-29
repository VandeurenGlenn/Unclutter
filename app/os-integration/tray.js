'use-strict';
const {Menu, Tray} = require('electron');
const name = require('electron').app.getName();
const Events = require('events');
const EventEmitter = new Events();
function click(eventName) {
  EventEmitter.emit(eventName);
}
class TrayMenu {
  constructor() {
    this.icon = 'resources/unclutter_icon.ico';
    this.tooltip = name;
    this.contextMenu = [
      {
        label: 'show', type: 'normal', click() {
          click('open-window');
        }
      }, {
        label: 'hide', type: 'normal', click() {
          click('close-window');
        }
      }, {
        type: 'separator'
      }, {
        label: 'quit app', type: 'normal', click() {
          click('quit-app');
        }
      }
    ];
  }

  set tray(opts) {
    if (!opts || !opts.icon) {
      return console.error('Icon expected where none is given :D');
    }
    this._tray = new Tray(opts.icon);
  }

  get tray() {
    return this._tray;
  }

  set icon(value) {
    this.tray = {icon: value};
  }

  set contextMenu(arr) {
    let contextMenu = Menu.buildFromTemplate(arr);
    this.tray.setContextMenu(contextMenu);
  }

  set tooltip(value) {
    this.tray.setToolTip(value);
  }
  // tray = new Tray('src/data/unclutter.png');

  on(eventName, cb) {
    this.tray.on(eventName, cb);
    EventEmitter.on(eventName, cb);
  }
}
module.exports = new TrayMenu();
