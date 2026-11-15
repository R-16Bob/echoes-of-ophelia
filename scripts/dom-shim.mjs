// 极简 DOM 垫片：只用于在 Node 里跑冒烟测试，不参与浏览器运行。

class DomNode {
  constructor() {
    this.childNodes = [];
    this.parentNode = null;
    this._events = {};
    this._attrs = {};
  }
  appendChild(child) {
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }
  append(...kids) {
    for (const kid of kids.flat()) if (kid) this.appendChild(kid);
  }
  prepend(...kids) {
    for (const kid of kids.flat().reverse()) if (kid) this.appendChild(kid);
  }
  replaceChildren(...kids) {
    this.childNodes = [];
    for (const kid of kids) if (kid) this.appendChild(kid);
  }
  addEventListener(type, fn) {
    this._events[type] = fn;
  }
  removeEventListener(type) {
    delete this._events[type];
  }
  setAttribute(key, value) {
    this._attrs[key] = String(value);
  }
  getAttribute(key) {
    return this._attrs[key];
  }
  remove() {
    if (!this.parentNode) return;
    this.parentNode.childNodes = this.parentNode.childNodes.filter((n) => n !== this);
  }
}

class DomText extends DomNode {
  constructor(text) {
    super();
    this.textContent = String(text);
  }
}

class DomElement extends DomNode {
  constructor(tag) {
    super();
    this.tagName = String(tag).toUpperCase();
    this.className = '';
    this.dataset = {};
    this.style = {};
    this._text = '';
    this._html = null;
  }
  set textContent(value) {
    this._text = String(value);
    this.childNodes = [];
  }
  get textContent() {
    return this._text;
  }
  set innerHTML(value) {
    this._html = String(value);
    this.childNodes = [];
  }
  get innerHTML() {
    return this._html;
  }
  get classList() {
    const self = this;
    const list = () => self.className.split(/\s+/).filter(Boolean);
    return {
      add: (...names) => {
        self.className = [...new Set([...list(), ...names])].join(' ');
      },
      remove: (...names) => {
        self.className = list().filter((n) => !names.includes(n)).join(' ');
      },
      contains: (name) => list().includes(name),
      toggle: (name, force) => {
        const has = list().includes(name);
        const want = force === undefined ? !has : Boolean(force);
        if (want && !has) self.className = [...list(), name].join(' ');
        if (!want && has) self.className = list().filter((n) => n !== name).join(' ');
      },
    };
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
  focus() {}
  scrollIntoView() {}
}

export function installDom() {
  globalThis.Node = DomNode;
  globalThis.HTMLElement = DomElement;
  const document = {
    createElement: (tag) => new DomElement(tag),
    createTextNode: (text) => new DomText(text),
    createDocumentFragment: () => new DomElement('#fragment'),
    querySelector: () => null,
    addEventListener: () => {},
  };
  globalThis.document = document;
  globalThis.window = { addEventListener: () => {} };
  // 简易 localStorage：让图鉴 / 设置的跨实例持久化可以在 Node 里验证。
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
  globalThis.Image = class {
    constructor() {
      this.style = {};
    }
    addEventListener() {}
  };
  return document;
}
