class CustomElementHelper {
  importStyle(opt) {
    var style = document.createElement('style');
    style.scope = opt.scopeName;
    style.innerHTML = opt.style;
    opt.target.appendChild(style);
  }
}

module.exports = new CustomElementHelper();
