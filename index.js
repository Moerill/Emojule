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
    onChange: createEmojiList
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
  TextEditor.enrichHTML = function (content, args) {
    let ret = oldFun.call(this, content, args);
    return ret.replace(/:\w+:/g, function(match, offset, src) {
      const data = CONFIG.emojule.list.find(e => e.code === match);
      return `<img class="emoji" draggable="false" src="${data?.url}" title="${data?.code}"/>`;
    });
  };
});

Hooks.on('renderChatLog', (app, html, options) => {
  const textarea = html.find('#chat-message');
  EmojiPleter.bind(textarea[0]);
  // html.find('#chat-log')[0].addEventListener('mouseenter', emojiZoom, true)
});


// Hooks.on('ready', () => {
//   new Emotings().render(true);
// });

async function emojiZoom(ev) {
  const emoji = ev.target.closest('.emoji')
  if (!emoji) return;
  console.log(emoji)
}


Hooks.on('ready', () => {
})
