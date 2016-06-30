'use-strict';
const helper = require('./../utils/custom-element-helper');

class UnclutterProgressBar extends HTMLElement {

  createdCallback() {
    this.root = this.shadowRoot || this.createShadowRoot();
    var div = document.createElement('div');
    div.classList.add('bar');
    var span = document.createElement('span');
    span.classList.add('info');
    span.innerHTML = `
      <span>
        <span class="done"></span>
        /
        <span class="total"></span>
      </span>`;
    this.root.appendChild(div);
    this.root.appendChild(span);
  }

  attachedCallback() {
    helper.importStyle({scopeName: this.localName,
      style: `:host {
        display: flex;
        flex-direction: row;
        width: 100%;
        // height: 32px;
        padding: 0.6em;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }

      :host(.show-info) .info {
        opacity: 1;
        transition: opacity ease-in 0.8s;
      }
      .info {
        left: 50%;
        top: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        opacity: 0;
        will-change: opacity;
        transition: opacity ease-out 0.8s;
      }
      .done {
        padding-right: 0.6em;
      }
      .total {
        padding-left: 0.6em;
      }
      .name {
        padding: 0.6em;
      }
      .bar {
        background: green;
        // position: absolute;
        width: 100%;
        height: 24px;
        -webkit-transform-origin: left center;
        transform-origin: left center;
        -webkit-transform: scaleX(0);
        transform: scaleX(0);
        will-change: transform;
        -webkit-transition-property: -webkit-transform;
        transition-property: transform;
        /* Duration */
        -webkit-transition-duration: 0.08s;
        transition-duration: 0.08s;
        /* Timing function */
        -webkit-transition-timing-function: ease;
        transition-timing-function: ease;
        /* Delay */
        -webkit-transition-delay: 0s;
        transition-delay: 0s;
        z-index: 0;
      }
      @-webkit-keyframes indeterminate-bar {
        0% {
          -webkit-transform: scaleX(1) translateX(-100%);
        }
        50% {
          -webkit-transform: scaleX(1) translateX(0%);
        }
        75% {
          -webkit-transform: scaleX(1) translateX(0%);
          -webkit-animation-timing-function: cubic-bezier(.28,.62,.37,.91);
        }
        100% {
          -webkit-transform: scaleX(0) translateX(0%);
        }
      }
      @-webkit-keyframes indeterminate-splitter {
        0% {
          -webkit-transform: scaleX(.75) translateX(-125%);
        }
        30% {
          -webkit-transform: scaleX(.75) translateX(-125%);
          -webkit-animation-timing-function: cubic-bezier(.42,0,.6,.8);
        }
        90% {
          -webkit-transform: scaleX(.75) translateX(125%);
        }
        100% {
          -webkit-transform: scaleX(.75) translateX(125%);
        }
      }
      @keyframes indeterminate-bar {
        0% {
          transform: scaleX(1) translateX(-100%);
        }
        50% {
          transform: scaleX(1) translateX(0%);
        }
        75% {
          transform: scaleX(1) translateX(0%);
          animation-timing-function: cubic-bezier(.28,.62,.37,.91);
        }
        100% {
          transform: scaleX(0) translateX(0%);
        }
      }
      @keyframes indeterminate-splitter {
        0% {
          transform: scaleX(.75) translateX(-125%);
        }
        30% {
          transform: scaleX(.75) translateX(-125%);
          animation-timing-function: cubic-bezier(.42,0,.6,.8);
        }
        90% {
          transform: scaleX(.75) translateX(125%);
        }
        100% {
          transform: scaleX(.75) translateX(125%);
        }
      }`,
      target: this.root
    });
    this.setAttribute('role', 'progressbar');
    this.now = 0;
    this.min = 0;
    this.max = 100;

    this.addEventListener('mouseover', this._onMouseover.bind(this));
    this.addEventListener('mouseout', this._onMouseout.bind(this));
  }

  _onMouseover() {
    this.classList.add('show-info');
  }

  _onMouseout() {
    this.classList.remove('show-info');
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (this.root && oldVal !== newVal) {
      switch (attr) {
        case 'name':
          this.name = newVal;
          break;
        case 'progress':
          this.progress = newVal;
          break;
        case 'min':
          this.min = newVal;
          break;
        case 'max':
          this.max = newVal;
          break;
        case 'total':
          this.total = newVal;
          break;
        case 'done':
          this.done = newVal;
          break;
        default:

      }
    }
  }

  set min(value) {
    this.setAttribute('aria-valuemin', value);
  }

  set max(value) {
    this.setAttribute('aria-valuemax', value);
  }

  set now(value) {
    this.setAttribute('aria-valuenow', value);
  }

  _queryShadow(query) {
    return this.root.querySelector(query);
  }

  get info() {
    return this._queryShadow('span.info');
  }

  set name(value) {
    this.setAttribute('name', value);
    // if (this.root && value !== 'all') {
    //   this.info.querySelector('.name').innerHTML = value;
    // }
  }

  set done(value) {
    this.info.querySelector('.done').innerHTML = value;
  }

  set total(value) {
    this.info.querySelector('.total').innerHTML = value;
  }

  set progress(ratio) {
    var transform = 'scaleX(' + (ratio / 100) + ')';
    var bar = this._queryShadow('.bar');
    // requestAnimationFrame(() => {
    bar.style.transform = bar.webkitTransform = transform;
    // });
    this.now = ratio;
  }
}

class UnclutterProgress extends HTMLElement {

  createdCallback() {
    this.root = this.shadowRoot || this.createShadowRoot();
    helper.importStyle({scopeName: this.localName,
      style: `:host {
        display: block;
        height: 0;
        width: 100%;
        opacity: 0;
        transform: translateY(100%);
      }
      :host([has-children]) {
        height: auto;
        opacity: 1;
        transform: translateY(0)
      }`,
      target: this.root
    });
  }

  _queryShadow(query) {
    return this.root.querySelector(query);
  }

  getProgressBar(key) {
    return this._queryShadow(`unclutter-progress-bar[name="${key}"]`);
  }

  updateProgressBar(target, obj) {
    target.progress = obj.progress;
    target.total = obj.total;
    target.done = obj.done;
  }

  set hasChildren(has) {
    if (has) {
      this.setAttribute('has-children', '');
    } else {
      this.removeAttribute('has-children');
    }
  }

  set _progressItems(obj) {
    if (obj) {
      for (let key of Object.keys(obj)) {
        var progressBar;
        try {
          progressBar = this.getProgressBar(key);
          this.updateProgressBar(progressBar, obj[key]);
        } catch (e) {
          progressBar = document.createElement('unclutter-progress-bar');
          this.root.appendChild(progressBar);
          progressBar.name = key;
          // progressBar = this.getProgressBar(key);
          this.updateProgressBar(progressBar, obj[key]);
        }
      }
      this.hasChildren = true;
    } else {
      this.hasChildren = false;
    }
  }

  get progressItems() {
    return this._progressItems || {};
  }
  /**
   * @arg {string} target the target to update
   * @arg {object} opt contains a
   */
  update(target, opt) {
    var items = this.progressItems;
    if (items[target]) {
      items[target] = opt.done;
    } else {
      items[target] = opt;
      items[target]._total = opt.total;
    }
    opt.progress = (opt.done / items[target]._total) * 100;
    this._progressItems = items;
    if (opt.progress === 100) {
      var key = target;
      setTimeout(() => {
        this.root.removeChild(this.getProgressBar(key));
      }, 10000);
    }
  }
}

document.registerElement('unclutter-progress-bar', UnclutterProgressBar);
document.registerElement('unclutter-progress', UnclutterProgress);
// module.exports = new UnclutterProgress();
