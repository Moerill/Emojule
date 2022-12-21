export default class EmojiPleter {
  constructor(element) {
    this.element = element;
    this.activateListeners(element);
  }

  activateListeners(element) {
    this.element.parentNode.addEventListener('keyup', this.onKeyUp, true);
    // we need to add it to the parent, since base fvtt does use "onCapture =  true" on the text area, which results in listeners being called in order of definition.... so preventing the "Enter" won't be possible that way
    this.element.parentNode.addEventListener('keydown', (ev) => this._onKeyDown(ev), true);
    this.element.addEventListener('submit', ev => console.log(ev));
  }

  _onKeyDown(ev) {
    const code = ev.key;
    if (code === 'Enter' && this._visible) {
      const word = this._getWord();
      if (/^:\w*$/.exec(word)) {
        ev.stopPropagation();
        ev.preventDefault();
        this.select(this._selected.querySelector('span').innerText);
      }
      this.close();
    } else if (code === "Escape") {
      this.close();
    } else if (code === 'ArrowDown' || code === 'ArrowUp') {
      // prevent up/down e.g. for codemirror
      ev.preventDefault(); ev.stopPropagation();
    }

  }

  onKeyUp = (ev) => this._onKeyUp(ev);

  _visible = false;

  _onKeyUp(ev) {
    if (ev.key === 'Enter') return;
    if (ev.key === 'ArrowUp') {
      ev.preventDefault(); ev.stopPropagation();
      const next = this._selected.nextElementSibling;
      if (!next) return;

      this._selected.classList.remove('selected');
      next.classList.add('selected');
      this._selected = next;
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault(); ev.stopPropagation();
      const next = this._selected.previousElementSibling;
      if (!next) return;

      this._selected.classList.remove('selected');
      next.classList.add('selected');
      this._selected = next;
    } else {
      const word = this._getWord();
      if (/^:\w+$/.exec(word)) {
        if (word !== this._word) {
          ev.preventDefault();
          ev.stopPropagation();
          this._word = word;
          this.update(word);
        }
        return;
      }
      this._word = word;
      this.close();
    }
  }

  _filter(str) {
    const str2 = str.substring(1);
    return [...CONFIG.emojule.list.filter(e => e.code.includes(str)), ...CONFIG.emojule.list.filter(e => e.code.includes(str2, 2))];
  }

  _getWord() {
    const start = this.element.selectionStart;
    const preText = this.element.value.substring(0, start);
    const afterText = this.element.value.substring(start)
    const wordStart = /\S*$/.exec(preText);
    const wordEnd = /^\S*/.exec(afterText);
    return wordStart[0] + wordEnd[0];
  }

  update(word) {
    const list = this.getListTemplate(word);
    if (!list) return this.close();

    if (!this._visible) this.show(list);
    this.html.replaceChild(list, this.html.children[0]);
    this._selected = this.html.querySelector('.emojipleter-emoji');
    this._selected.classList.add('selected');
    this.html.scrollTop = this.html.scrollHeight;
  }

  getListTemplate(word) {
    const list = this._filter(word);
    if (list.length === 0) return null;
    const ul = document.createElement('ul');
    ul.classList.add('emojipleter-emojilist');
    for (let e of list) {
      const li = ul.appendChild(document.createElement('li'));
      li.classList.add('emojipleter-emoji');
      const img = li.appendChild(document.createElement('img'))
      img.src = e.url;
      img.classList.add('emoji');
      img.draggable = false;
      li.appendChild(document.createElement('span')).innerText = e.code;
    }
    return ul;
  }

  get spawnCSS() {
    const rect = this.element.parentNode.getBoundingClientRect();
    return {
      width: rect.width + 'px',
      bottom: window.innerHeight - rect.top + 'px',
      left: rect.left + 'px'
    }
  }

  show(list) {
    if (this.html) return;
    const div = document.createElement('div');
    div.id = 'emojipleter';
    div.appendChild(list);
    document.body.appendChild(div);
    
    div.scrollTop = div.scrollHeight;
    this.html = div;
    const css = this.spawnCSS;
    for (let key in css) {
      this.html.style[key] = css[key];
    }

    div.addEventListener('click', ev => {
      const target = ev.target.closest('.emojipleter-emoji');
      if (!target) return;
      this.select(target.querySelector('span').innerText);
      this.close();
    });
    div.addEventListener('mousemove', ev => {
      const target = ev.target.closest('.emojipleter-emoji');
      if (!target || target === this._selected) return;
      if (this._selected)
        this._selected.classList.remove('selected');
      this._selected = target;
      target.classList.add('selected');
    })
    this._visible = true;
  }

  close()  {
    if (!this._visible) return;

    this.html.remove();
    this.html = null;
    this._visible = false;
  }

  select(str) {
    if (false === Hooks.call('emojuleSelectEmoji', str, this.element)) return;

    const orig = this.element.value;
    const start = this.element.selectionStart;
    const preText = this.element.value.substring(0, start);
    const afterText = this.element.value.substring(start)
    const wordStart = /\S*$/.exec(preText)[0];
    const wordEnd = /^\S*/.exec(afterText)[0];
    
    this.element.value = orig.substring(0, start - wordStart.length)
                       + str
                       + orig.substring(start + wordEnd.length);
  }

  static bind(element) {
    return new EmojiPleter(element);
  }
}