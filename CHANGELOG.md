# v0.3.1

- *FIX* custom emoji settings sometimes disappearing after reopening and closing the settings window.

# v0.3

- *NEW* Emojis are now scaled when only emojis were sent (similar do e.g. discord or telegram)
- made emojipleter more easily extendable for other modules to use (e.g. Meme)
- *NEW* Hook ``emojuleSelectEmoji`` with the selected emoji code as parameter.
  - parameters: emojicode, element
  - Allows to react to selected emoji insertion
  - ``return false`` to stop insertion
- removed one emoji that is not available in the twemoji image pack

# v0.2.0

- *NEW* Custom emoji support!
- Updated emoji list to support the newest unicode standard!
- Suggestions is now shown for partial matches inside of the code words as well!
- Now using ``PNG`` files instead of ``SVG`` to reduce space used. The old svg files remain until some time in the future (latest 1.0.0) to support backwards compatibility. At that point old messages are probably far enough back in the chat log to not matter anymore.
- Restructured data and some code to massively decrease memory usage and increase performance

# v0.1.2

- Fix wrong paths remaining after module renaming

# v0.1.0

* Initial release