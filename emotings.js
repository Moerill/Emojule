export default class Emotings extends FormApplication {
  constructor(object = game.settings.get('emojule', 'emojis'), options) {
    super(object, options);
  }
	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: "modules/emojule/html/emotings.html",
			height: "auto",
			title: "Emojule - Settings",
      width: 400,
      resizable: true,
			classes: ["emojule", "settings"],
			tabs: [ 
				{
					navSelector: '.tabs',
					contentSelector: 'form',
					initial: 'emojis'
				} 
			],
			submitOnClose: true
		}
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    const emojuleList = html[0].querySelector('.emojule-custom-emoji-list');
    emojuleList.addEventListener('click', (ev) => {
      let target = ev.target.closest('.emojule-placeholder');
      if (target) {
        target.classList.remove('emojule-placeholder');
        target.innerText = '';
        target.addEventListener('focusout', this._onUnfocus);
        return;
      }

      target = ev.target.closest('.emojule-add-new-custom-emoji a');
      if (target) 
        return this._addCustomEmojiRow(target);

      target = ev.target.closest('.emojule-remove-emoji');
      if (target)
        return this._removeRow(target); 

      target = ev.target.closest('.emojule-select-image');
      if (target)
        return this._selectEmojiImage(target);
    });

    emojuleList.addEventListener('keydown', (ev) => {
      let target = ev.target.closest('.emojule-code');
      if (target) {
        return this._blockInput(ev);
      }

    });

    emojuleList.querySelectorAll('.emojule-code').forEach(e => e.addEventListener('focusout', this._onUnfocus));
  }

  _blockInput(ev) {
    const code = game.keyboard.getKey(ev);
    if (/^(\w?|Backspace|Shift|Control|Alt)$/.exec(code))
      return;
    
    ev.preventDefault(); ev.stopPropagation();

    if (/^Enter$/.exec(code)) {
      target.blur();
      return;
    }

    ui.notifications.error('Only alphanumerical keys and "_" are allowed!')
    return;
  }1

  _onUnfocus = (ev) => this._onUnfocusEmojuleCode(ev);
  _onUnfocusEmojuleCode(ev) {
    ev.preventDefault(); ev.stopPropagation();
    if (ev.currentTarget.innerText === '') {
      ev.currentTarget.classList.add('emojule-placeholder');
      ev.currentTarget.innerText = 'custom_emoji_code_here';

      ev.currentTarget.removeEventListener('focusout', this._onUnfocus);
    }
    this._updateObject();
  }

  async _addCustomEmojiRow(target) {
    const template = await renderTemplate('modules/emojule/html/new-emoji.html');
    const frag = document.createElement('div');
    frag.innerHTML = template;
    target = target.closest('li');
    target.parentNode.insertBefore(frag.children[0], target);
    this.setPosition();
  }

  _removeRow(target) {
    target.closest('li').remove();
    this._updateObject();
    this.setPosition();
  }

  _selectEmojiImage(target) {
    let img = target.querySelector('img');
    if (!img) {
      target.children[0].remove();
      img = target.appendChild(document.createElement('img'));
      img.classList.add('emoji');
    }
    // use dataset for path, since "src" returns the complete address (including e.g. localhost:30000) resulting in the filepicker erroring
    new FilePicker({
      type: "image",
      current: img.dataset.path || "",
      callback: path => {
        img.src = path;
        img.dataset.path = path;
        this._updateObject();
      }
    }).browse(img.dataset.path || "");
  }

  getData() {
    const data = super.getData();
    data.customEmojis = this.object;
    return data;
  }

  async _render(...args) {
    await loadTemplates(['modules/emojule/html/new-emoji.html']);
    super._render(args);
  }

  _updateObject(ev, formData) {
    const obj = Object.fromEntries(Array.from(this.form.querySelectorAll('.emojule-custom-emoji')).map(row => {
      const img = row.querySelector('img');
      const code = row.querySelector('.emojule-code:not(.emojule-placeholder)');
      return [code?.innerText, img?.dataset.path];
    }).filter(row => row[0] && row[1]));
    game.settings.set('emojule', 'emojis', obj)
  }
}