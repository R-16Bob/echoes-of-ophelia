// 极简 DOM 构造器：不引框架，保持零依赖。

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class' || key === 'className') el.className = value;
      else if (key === 'html') el.innerHTML = value;
      else if (key === 'text') el.textContent = value;
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
      else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value === true) el.setAttribute(key, '');
      else el.setAttribute(key, value);
    }
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) append(el, child);
    else if (child instanceof Node) el.appendChild(child);
    else el.appendChild(document.createTextNode(String(child)));
  }
}

export function frag(...children) {
  const f = document.createDocumentFragment();
  append(f, children);
  return f;
}

export function clear(el) {
  el.replaceChildren();
}

export function paragraphs(lines = [], className = '') {
  const list = Array.isArray(lines) ? lines : [lines];
  return list.map((line) => h('p', { class: className }, line));
}

export function icon(name, title) {
  const glyphs = {
    map: '▤', bag: '▣', user: '☖', clue: '✎', rules: '?', close: '✕',
    coin: '◈', hp: '♥', san: '◍', xp: '✦', time: '◷', lock: '⌧',
  };
  return h('button', { class: 'icon-btn', title, 'aria-label': title }, glyphs[name] || '·');
}
