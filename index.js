import { emojiData } from './data/emoji.js';

import twemoji from './data/twemoji.esm.js';

import EmojiPleter from './emojipleter.js';


(() => {
  window.twemoji = twemoji;

  twemoji.base = 'modules/emojule/';
  twemoji.ext = '.svg'
  const regExp = RegExp(Object.keys(emojiData)
                          .map((name) => ':' + name + ':')
                          .sort()
                          .reverse()
                          .join('|'), 'g');

  const oldFun = TextEditor.enrichHTML;
  TextEditor.enrichHTML = function (content, args) {
    let ret = oldFun.call(this, content, args);

    return ret.replace(regExp, function(match, offset, src) {
      return twemoji.parse(emojiData[match.slice(1, -1)], {
        base: 'modules/emojule/',
        folder: 'assets',
        ext: '.svg'
      });
    });
  };

  console.log(emojiData)
})();

Hooks.on('renderChatLog', (app, html, options) => {
  
  const textarea = html.find('#chat-message');
  EmojiPleter.bind(textarea[0]);
});