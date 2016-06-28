'use-strict';

class UnDrawerItem extends HTMLElement {
  createdCallback() {
    window.requestAnimationFrame(() => {
      this.style.display = 'inline-flex';
      this.style.flexDirection = 'row';
      this.style.alignItems = 'center';
      // this.style.justifyContent = 'center';
      this.style.height = '48px';
      this.style.width = '100%';
      this.style.padding = '0.6em 0.8em';
      this.style.boxSizing = 'border-box';
    });
  }
}

class UnDrawer extends HTMLElement {
  // constructor() {
  //
  // }

  createdCallback() {
    window.requestAnimationFrame(() => {
      this._applyStyles();
      this.innerHTML = `<header
        class="drawer-header"
        style="padding: 0.6em 0.8em; box-sizing: border-box">
      <h1 class="menu-title">menu</h1></header>
      <div class="drawer-content">${this.innerHTML}</div>`;
    });
  }

  get drawerWidth() {
    var attr = this.getAttribute('drawer-width');
    return attr ? attr : '256px';
  }

  get opened() {
    return this.hasAttribute('opened');
  }

  set opened(open) {
    if (open) {
      this.style.transform = 'translateX(0)';
      this.setAttribute('opened', '');
    } else {
      this.style.transform = 'translateX(-102%)';
      this.removeAttribute('opened');
    }
    this.dispatchEvent(new CustomEvent('opened-changed', {detail: open}));
  }

  _applyStyles() {
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.height = '100%';
    this.style.willChange = 'transform';
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }
}

document.registerElement('un-drawer-item', UnDrawerItem);
document.registerElement('un-drawer', UnDrawer);
