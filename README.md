# joontop-editor

## Usage

```js
import Editor from 'joontop-editor';

const options = {
  hashClass: 'hash',
  mentionClass: 'mention',
  editorClass: '__editor',
  layerClass: '__layer',
  layerDataClass: '__layer_data',
  hashData: [
    'apartment',
    'aplication',
    'apple',
    'balloon',
    'baseball',
    'city',
    'cyber',
    'definition',
    'newsletter',
    'english',
    'language',
    'discussion',
    'edited',
    'apparently',
    'agree',
    'looking',
    'through',
    'google',
    'interesting',
    'superficial',
    'item',
    'good',
    'corresponds',
    'plural',
    'grammar',
    'everyone',
    'singular',
  ],
  mentionData: [
    'ajax',
    'bjay',
    'cyon',
    'damon',
    'eamon',
    'fashion',
    'ghost',
    'human',
    'intel',
    'july',
    'kill',
    'lime',
    'man',
    'none',
    'orange',
    'phone',
    'question',
    'ryan',
    'simon',
    'tube',
    'unit',
    'vacation',
    'wow',
    'xenocide',
    'yellow',
    'zion',
  ],
  target: document.querySelector('.editor'),
};
const editor = new Editor(options);
editor.start();

```

## Sample URL
https://joontop.github.io/joontop-editor/sample/

## License
MIT

