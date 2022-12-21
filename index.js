import { defaultEmojis } from './data/emoji.js';


import EmojiPleter from './emojipleter.js';
import Emotings from './emotings.js';


// import { emojiData } from './data/emoji_data.js';
// let customData = emojiData.filter(e => e.has_img_google);
// customData = customData.map(e => {
//   let code = e.short_name.replace(/-/g, "_");
//   // mainly for thumbsup
//   if (!/^\w+$/.exec(code)) {
//     code = e.short_names.find(el => /^\w+$/.exec(el.replace(/-/g, '_')))?.replace(/-/g,'_');
//   }
//   let img = e.unified.toLowerCase();
//   // img = img.split('-').map(e => parseInt(e,16).toString(16)).join('-')
//   return [code, 'modules/emojule/assets/twitter-72/' + img + '.png']
// })
// customData = Object.fromEntries(customData);
// console.log(JSON.stringify(customData));

// console.log(Object.keys(customData).filter(e => e.includes('face_with')))


// const defaultEmojis = customData; 

async function createEmojiList(newEmojis = {}) {
  const emojis = {...defaultEmojis, ...newEmojis};
  CONFIG.emojule = {
    list: Object.entries(emojis)
                .sort((a,b) => a[0] > b[0])
                .map(e => {
                  const [name, url] = e;
                  return {
                    code: ':' + name + ':',
                    url
                  }
                })
  }
}

Hooks.on('init', () => {
  game.settings.register('emojule', 'emojis', {
    default: {},
    type: Object,
    config: false,
    onChange: createEmojiList,
    scope: "world"
  });

  game.settings.registerMenu('emojule', 'emojiSettings', {
    name: '',
    label: 'Custom Emoji Configurator',
    icon: 'fas fa-mug-hot',
    type: Emotings,
    restricted: true
  })
});

Hooks.on('ready', async () => {
  await createEmojiList(game.settings.get('emojule', 'emojis'));
  const oldFun = TextEditor.enrichHTML;
  TextEditor.enrichHTML = async function (content, args) {
    let ret = oldFun.call(this, content, args);
    if (ret.__proto__ === Promise.prototype) {
      ret = await ret;
    }
    ret = ret.replace(/:\w+:/g, function(match, offset, src) {
      const data = CONFIG.emojule.list.find(e => e.code === match);
      return `<img class="emoji" draggable="false" src="${data?.url}" title="${data?.code.slice(1, -1)}"/>`;
    });

    // Check whether the messages content only consists of emojis
    const div = document.createElement('div');
    div.innerHTML = ret;
    const emojis = Array.from(div.querySelectorAll('.emoji'));
    if (!emojis.length) return ret;

    let parent = div;
    // allow for emojis to be nested one container below the original message content
    if (div.children.length === 1 && div.children[0].tagName !== 'IMG')
      parent = div.children[0];

    for (let child of parent.childNodes) {
      if (child.classList?.contains('emoji')) continue;

      // check whether there are only spaces in possible sibling text nodes
      if (child.tagName || !/^\s*$/.exec(child.textContent))
        return ret;
    }

    for (let emoji of emojis) 
      emoji.classList.add('emoji-large');

    ret = div.innerHTML;
    return ret;
  };
});

Hooks.on('renderChatLog', (app, html, options) => {
  const textarea = html.find('#chat-message');
  EmojiPleter.bind(textarea[0]);
  // html.find('#chat-log')[0].addEventListener('mouseenter', emojiZoom, true)
});