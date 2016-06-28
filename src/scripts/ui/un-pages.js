'use strict';

class UnPage extends HTMLElement {
  // constructor() {
  //
  // }
}

class UnPages extends HTMLElement {
  // constructor() {
  //   super();
  //   this.pages = this.querySelectorAll('un-page');
  // }

  createdCallback() {
    // use shadowRoot if already defined else create shadowRoot
    // needed when using as a child in custom-element (maybe only polymer element?).
    // TODO: should be an controller?
    this.root = this.shadowRoot || this.createShadowRoot();
    this.style.flex = 1;
    var style = document.createElement('style');
    style.scope = this.localName;
    style.innerHTML = ':host .hidden { display: none; }';
    this.root.appendChild(style);
    for (var child in this.children) {
      // if (this.children[child].nodeType === '1') {
      if (this.children.hasOwnProperty(child)) {
        this.root.appendChild(this.children[child]);
      }
      // }
    }
  }

  get attrForSelected() {
    var attr = this.getAttribute('attr-for-selected');
    return attr ? attr : 'name';
  }

  get pageElements() {
    var attr = this.getAttribute('page-elements');
    return attr ? attr : 'un-page';
  }

  set selected(value) {
    this._updateSelectedPage(value);
    this.setAttribute('selected', value);
  }

  get selected() {
    return this.getAttribute('selected');
  }

  get pages() {
    return this.children;
  }

  get _shadowPages() {
    return this.root.children;
  }

  get _pages() {
    return Object.keys(this.pages);
  }

  get _SelectedPageIndex() {
    return this._pages.indexOf(this.selected);
  }

  _updateActivePage(el, mode) {
    requestAnimationFrame(() => {
      if (mode && mode === 'remove') {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }

  _updateSelectedPage(value) {
    if (value && value !== this.oldPage) {
      var pages = this._shadowPages;
      for (var page in pages) {
        if (pages.hasOwnProperty(page)) {
          if (pages[page].getAttribute(this.attrForSelected) === value) {
            this._updateActivePage(pages[page], 'remove');
          } else if (this.oldPage || !this.oldPage) {
            this._updateActivePage(pages[page]);
          }
        }
      }
      this.oldPage = value;
    }
  }

  next() {
    this._SelectedPageIndex += 1;
    this.selected = this._pages[this._SelectedPageIndex];
  }

  previous() {
    this._SelectedPageIndex -= 1;
    this.selected = this._pages[this._SelectedPageIndex];
  }
}

document.registerElement('un-page', UnPage);
document.registerElement('un-pages', UnPages);
