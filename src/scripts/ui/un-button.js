'use-strict';
//     this.style.height = '48px';
//     this.style.padding = '8px 16px';
//     this.style.boxSizing = 'border-box';
//     this.style.justifyContent = 'center';
//     this.style.alignItems = 'center';
class UnButton extends HTMLElement {
  attachedCallback() {
    this._setup();
  }

  get _is() {
    return this.getAttribute('is');
  }

  /**
   * true or false
   */
  get _active() {
    return this.getAttribute('active') || this.hasAttribute('active') || false;
  }

  get active() {
    return this._active;
  }

  set active(value) {
    if (value) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  get _title() {
    return this.getAttribute('default-title') || this._label;
  }

  get _activeTitle() {
    return this.getAttribute('active-title') || this._label;
  }

  get _name() {
    var name = this.name;
    return name || this._content;
  }

  get name() {
    return this.getAttribute('name');
  }

  get _content() {
    return this.innerHTML;
  }

  get label() {
    return this.getAttribute('label');
  }

  get _label() {
    var label = this.label;
    return label || this._name;
  }

  get activeLabel() {
    return this.getAttribute('active-label') || this._label;
  }

  get _labelContainer() {
    return this.root.querySelector('.label-container');
  }

  get _toggleButton() {
    return this.root.querySelector('.toggle-button');
  }

  get icon() {
    return this.getAttribute('icon');
  }

  set icon(value) {
    var iconElement = this.root.querySelector('iron-icon');
    iconElement.icon = value;
    console.log(value);
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (attr === 'icon' && this.root) {
      this.icon = newVal;
    }
  }

  _setup() {
    this.root = this.createShadowRoot();
    // TODO: import css instead ...
    this._cssClasses = [];
    this._eventsMixin = `
:host([pressed]) {
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
}`;
    this._hostMixin = `
  display: inline-flex;
  cursor: pointer;
  outline: none;
  padding: 0.8em;
  box-sizing: border-box;
  align-items: center;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  user-select: none;`;
    this._shadowMixin = `box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
              0 1px 10px 0 rgba(0, 0, 0, 0.12),
              0 2px 4px -1px rgba(0, 0, 0, 0.4);`;
    this._cssClasses = {
      'button': `
:host {
  height: 48px;
  border-radius: 3px;
  min-width: 96px;
  ${this._hostMixin}
  justify-content: center;
}
:host([shadow]) {
  ${this._shadowMixin}
}${this._eventsMixin}`,
      'fab': `
        :host {
          height: 56px;
          min-width: 0;
          width: 56px;
          ${this._hostMixin}
          border-radius: 50%;
          background: #bbdefb;
          justify-content: center;
          ${this._shadowMixin}
        }
        :host([mini]) {
          width: 40px;
          height: 40px;
          padding: 0.5em;
        }
        ${this._eventsMixin}`,
      'toggle': `
        :host {
          ${this._hostMixin}
        }
        :host([active]) .toggle-button {
          -webkit-transform: translate(16px, 0);
          transform: translate(16px, 0);
          background: #4caf50;
        }
        :host .toggle-container {
          display: inline-block;
          position: relative;
          width: 36px;
          height: 14px;
          margin-right: 0.6em;
        }
        :host .toggle-bar {
          position: absolute;
          height: 100%;
          width: 100%;
          border-radius: 8px;
          pointer-events: none;
          opacity: 0.4;
          transition: background-color linear .08s;
          background-color: #FFF;
        }
        :host .toggle-button {
          position: absolute;
          top: -3px;
          left: 0;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.6);
          transition: -webkit-transform linear .08s, background-color linear .08s;
          transition: transform linear .08s, background-color linear .08s;
          -webkit-transform: translate(0);
          transform: translate(0);
          will-change: transform;
          background-color: #fafafa;
        }
        .toggle-button.dragging {
          -webkit-transition: none;
          transition: none;
        }`,
      'icon-button': `
:host {
  height: 48px;
  border-radius: 3px;
  min-width: 96px;
  ${this._hostMixin}
  justify-content: center;
}
:host([shadow]) {
  ${this._shadowMixin}
}
.label-container: {
  padding-left: 0.6em;
}${this._eventsMixin}`
    };
    // var shadow = this.createShadowRoot();
    this.is = this._is;
    this.root.addEventListener('mousedown', this._onMouseDown.bind(this));
    this.root.addEventListener('mouseup', this._onMouseUp.bind(this));
    if (this.is) {
      this._applyStylesFor(this.is);
    } else {
      this._applyStylesFor('button');
    }
  }

  _onMouseDown() {
    this.setAttribute('pressed', '');
  }

  _onMouseUp() {
    this.removeAttribute('pressed');
  }

  _tapHandler() {
    if (this._active) {
      this.active = false;
    } else {
      this.active = true;
    }
    this._applyActiveText(this.active);
    // this._toggleButton.innerHTML
    this.dispatchEvent(new CustomEvent('active-change', {detail: this.active}));
  }

  _applyActiveText(active) {
    if (active) {
      this.title = this._activeTitle;
      this._labelContainer.innerHTML = this.activeLabel;
    } else {
      this.title = this._title;
      this._labelContainer.innerHTML = this.label;
    }
  }

  _applyStylesFor(is) {
    var style = document.createElement('style');
    style.scope = this.localName;
    for (let key of Object.keys(this._cssClasses)) {
      if (key === is) {
        style.innerHTML = this._cssClasses[key];
        requestAnimationFrame(() => {
          this.root.appendChild(style);
        });
      }
    }
    this._applyLabel(is);
  }

  _applyLabel(a) {
    let label = `
    <span class="label-container">
    ${this._label}
    </span>`;
    this.title = this._title;
    switch (a) {
      case 'toggle':
        this.root.addEventListener('click', this._tapHandler.bind(this));
        // if (label) {
        this.root.innerHTML += `
          <div class="toggle-container">
            <div class="toggle-bar">
              <div class="toggle-button"></div>
            </div>
          </div>
          ${label}`;
        // } else {
        //   this.innerHTML = `${innerHTML ? innerHTML : label}`;
        // }

        this._applyActiveText(this.active);
        break;
      case 'fab':
        if (this.innerHTML.includes('icon')) {
          this.root.innerHTML += this.innerHTML;
        } else if (this.icon) {
          this.root.innerHTML += `
          <iron-icon icon="${this.icon}"></iron-icon>`;
        } else {
          this.root.innerHTML += label;
        }
      // this
        // this.title = this._label;
        break;
      case 'icon-button':
        // weird, css doesn't apply, set style on the element for now ...
        if (this.icon) {
          this.root.innerHTML += `
          <iron-icon icon="${this.icon}"
            style="padding-right: 0.6em">
          </iron-icon>
          ${label}`;
        } else {
          this.root.innerHTML += label;
        }
        break;
      default:
        this.root.innerHTML += label;
        break;
    }
  }
}

document.registerElement('un-button', UnButton);
