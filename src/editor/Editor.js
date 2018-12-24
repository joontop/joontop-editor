import Options from './Options';
import CONFIG from './Config';
import util from '../util/util';

export default class Editor {
  constructor(options = {}) {
    Options.setDatas(options);
    this.range = null;
    this.selection = null;
    this.editArea = null;
    this.layer = null;
    this.autoData = [];
    this.autoCnt = 0;
    this.autoTarget = null;
    this.state = {
      currentTag: null,
      isTag: false,
      // isHash: Options.getHashData().length > 0,
      // isMention: Options.getMentionData().length > 0,
    };
    this.layerState = {
      data: [],
      idx: 0,
      isOpen: false,
    };
  }
  start() {
    this.editArea = this.getEditorElement();
    this.layer = this.getLayerElement();
    Options.getTarget().appendChild(this.editArea);
    document.querySelector('body').appendChild(this.layer);
    this.setEvent();
  }
  getEditorElement() {
    const element = document.createElement('div');
    element.className = Options.getEditorClass();
    element.setAttribute('contentEditable', true);
    element.setAttribute('spellcheck', false);
    Object.assign(element.style, CONFIG.EDITOR.CSS);
    return element;
  }
  getLayerElement() {
    const element = document.createElement('div');
    element.className = Options.getLayerClass();
    Object.assign(element.style, CONFIG.LAYER.CSS);
    return element;
  }
  setEvent() {
    if (this.editArea) {
      this.editArea.addEventListener('keydown', this.onKeydownEvent.bind(this));
      this.editArea.addEventListener('keyup', this.onKeyupEvent.bind(this));
      this.editArea.addEventListener('mouseup', this.onMouseupEvent.bind(this));
      this.editArea.addEventListener('paste', this.onPasteEvent.bind(this));
      document.addEventListener('keyup', this.onDocumentKeyUpEvent.bind(this));
    }
  }
  onKeydownEvent(e) {
    let _keyCode = e.which || e.keyCode;
    let chCode = e.key.charCodeAt(0);
    this.selection = window.getSelection();
    if (this.selection.rangeCount <= 0) {
      return;
    }
    this.range = this.selection.getRangeAt(0);
    this.setTagState();
    if (this.layerState.isOpen && _keyCode === CONFIG.KEYCODE.ENTER) {
      e.preventDefault();
      return;
    }
    if (this.layerState.isOpen && _keyCode === CONFIG.KEYCODE.UP) {
      e.preventDefault();
      return;
    }
    if (this.layerState.isOpen && _keyCode === CONFIG.KEYCODE.DOWN) {
      e.preventDefault();
      return;
    }
    if (
      _keyCode === CONFIG.KEYCODE.LEFT ||
      _keyCode === CONFIG.KEYCODE.UP ||
      _keyCode === CONFIG.KEYCODE.RIGHT ||
      _keyCode === CONFIG.KEYCODE.DOWN
    ) {
    } else {
      this.closeLayer();
      this.autoComplete(e);
    }
    if (
      _keyCode === CONFIG.KEYCODE.PGUP ||
      _keyCode === CONFIG.KEYCODE.PGDN ||
      _keyCode === CONFIG.KEYCODE.END ||
      _keyCode === CONFIG.KEYCODE.HOME ||
      _keyCode === CONFIG.KEYCODE.LEFT ||
      _keyCode === CONFIG.KEYCODE.UP ||
      _keyCode === CONFIG.KEYCODE.RIGHT ||
      _keyCode === CONFIG.KEYCODE.DOWN ||
      _keyCode === CONFIG.KEYCODE.SPACEBAR ||
      _keyCode === CONFIG.KEYCODE.ENTER ||
      _keyCode === CONFIG.KEYCODE.BACKSPACE ||
      _keyCode === CONFIG.KEYCODE.DEL
    ) {
    } else {
      this.range.collapse(true);
    }
    if (e.ctrlKey && _keyCode === CONFIG.KEYCODE.V) {
    } else if (_keyCode === CONFIG.KEYCODE.SPACEBAR) {
      this.onPressSpacebarKey(e);
    } else if (_keyCode === CONFIG.KEYCODE.ENTER) {
      this.onPressEnterKey(e);
    } else if (
      (e.shiftKey && _keyCode === CONFIG.KEYCODE.HASHTAG) ||
      chCode === 35
    ) {
      this.onPressHashKey(e);
    } else if (e.shiftKey && _keyCode === CONFIG.KEYCODE.MENTION) {
      this.onPressMentionKey(e);
    }
  }
  onKeyupEvent(e) {
    let _keyCode = e.which || e.keyCode;
    this.selection = window.getSelection();
    if (this.selection.rangeCount <= 0) {
      return;
    }
    this.range = this.selection.getRangeAt(0);
    this.setTagState();

    if (this.layerState.isOpen && _keyCode === CONFIG.KEYCODE.ENTER) {
      e.preventDefault();
      return;
    }
    if (this.layerState.isOpen && _keyCode === CONFIG.KEYCODE.UP) {
      e.preventDefault();
      return;
    }
    if (this.layerState.isOpen && _keyCode === CONFIG.KEYCODE.DOWN) {
      e.preventDefault();
      return;
    }
    if (
      _keyCode === CONFIG.KEYCODE.LEFT ||
      _keyCode === CONFIG.KEYCODE.UP ||
      _keyCode === CONFIG.KEYCODE.RIGHT ||
      _keyCode === CONFIG.KEYCODE.DOWN
    ) {
      this.closeLayer();
      this.autoComplete(e);
    } else if (
      _keyCode === CONFIG.KEYCODE.BACKSPACE ||
      _keyCode === CONFIG.KEYCODE.DEL
    ) {
      this.checkTag();
    }
  }
  onMouseupEvent() {
    this.selection = window.getSelection();
    if (this.selection.rangeCount <= 0) {
      return;
    }
    this.range = this.selection.getRangeAt(0);
    this.setTagState();

    if (
      this.range.commonAncestorContainer.parentNode.nodeName.toUpperCase() ===
      CONFIG.TAG_ELEMENT
    ) {
    } else {
      this.closeLayer();
    }
  }
  onPasteEvent(e) {
    e.preventDefault();
    let _clipboardData = e.clipboardData || window.clipboardData;
    let _pastedData = _clipboardData.getData('text/plain');
    _pastedData = _pastedData.replace(
      /([#])\w+/gi,
      '<' +
        CONFIG.TAG_ELEMENT +
        " class='" +
        Options.getHashClass() +
        "'>$&</" +
        CONFIG.TAG_ELEMENT +
        '>'
    );
    _pastedData = _pastedData.replace(
      /([@])\w+/gi,
      '<' +
        CONFIG.TAG_ELEMENT +
        " class='" +
        Options.getMentionClass() +
        "'>$&</" +
        CONFIG.TAG_ELEMENT +
        '>'
    );
    _pastedData = _pastedData.replace(/\n/gi, '<br>');
    let _textNode = document.createTextNode(_pastedData);
    this.range.insertNode(_textNode);
    this.range.setStartAfter(_textNode);
    this.range.collapse(true);
    this.selection.removeAllRanges();
    this.selection.addRange(this.range);
    this.editArea.innerHTML = this.editArea.innerHTML
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>');
  }
  onPressHashKey(e) {
    e.preventDefault();
    this.state.currentTag = CONFIG.WORDS.HASHTAG;
    this.insertTag(CONFIG.WORDS.HASHTAG, Options.getHashClass());
  }
  onPressMentionKey(e) {
    e.preventDefault();
    this.state.currentTag = CONFIG.WORDS.MENTION;
    this.insertTag(CONFIG.WORDS.MENTION, Options.getMentionClass());
  }
  onPressSpacebarKey(e) {
    e.preventDefault();
    this.insertSpacebar();
  }
  onPressEnterKey(e) {
    e.preventDefault();
    this.insertEnter();
  }
  setTagState() {
    if (this.range.commonAncestorContainer) {
      let _node = this.range.commonAncestorContainer;
      this.state.isTag =
        _node.nodeName.toUpperCase() === CONFIG.TAG_ELEMENT ||
        _node.parentNode.nodeName.toUpperCase() === CONFIG.TAG_ELEMENT;
    }
  }
  checkTag() {
    let _wrapper = null;
    let _childNodes = [];
    if (
      this.range.commonAncestorContainer.parentNode &&
      this.range.commonAncestorContainer.parentNode.nodeName === 'DIV'
    ) {
      _wrapper = this.range.commonAncestorContainer.parentNode;
      _childNodes = this.range.commonAncestorContainer.parentNode.childNodes;
    } else if (
      this.range.commonAncestorContainer.parentNode.parentNode &&
      this.range.commonAncestorContainer.parentNode.parentNode.nodeName ===
        'DIV'
    ) {
      _wrapper = this.range.commonAncestorContainer.parentNode.parentNode;
      _childNodes = this.range.commonAncestorContainer.parentNode.parentNode
        .childNodes;
    }
    for (let i = 0; i < _childNodes.length; i++) {
      if (_childNodes[i].nodeName === CONFIG.TAG_ELEMENT) {
        if (
          _childNodes[i].innerHTML.indexOf(CONFIG.WORDS.HASHTAG) === 0 ||
          _childNodes[i].innerHTML.indexOf(CONFIG.WORDS.MENTION) === 0
        ) {
        } else {
          util.insertAfter(
            document.createTextNode(_childNodes[i].innerHTML),
            _childNodes[i]
          );
          _wrapper.removeChild(_childNodes[i]);
        }
      }
    }
  }
  insertTag(_word, _class) {
    if (!this.state.isTag) {
      let tagElement = document.createElement(CONFIG.TAG_ELEMENT);
      let tagTextNode = document.createTextNode(_word);
      tagElement.setAttribute('class', _class);
      tagElement.appendChild(tagTextNode);
      this.range.insertNode(tagElement);
      this.range.setStartAfter(tagTextNode);
      this.range.collapse(true);
      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
      this.setPositionLayer(tagElement);
      this.state.isTag = true;
    }
  }
  insertSpacebar() {
    let _firstElement = document.createTextNode('\u00A0');
    let _secondElement = document.createTextNode('\u00A0');
    this.processRemainingText(_firstElement);
    // this.range.insertNode(_secondElement);
    // this.range.setStartBefore(_secondElement);
    this.selection.removeAllRanges();
    this.selection.addRange(this.range);
    // document.execCommand('delete');
  }
  insertEnter() {
    let _firstElement = document.createElement('br');
    let _secondElement = document.createTextNode('\u00A0');
    this.processRemainingText(_firstElement);
    this.range.insertNode(_secondElement);
    this.range.setStartBefore(_secondElement);
    this.selection.removeAllRanges();
    this.selection.addRange(this.range);
    document.execCommand('delete');
  }
  processRemainingText(_firstElement) {
    if (this.state.isTag) {
      let _node = this.range.commonAncestorContainer;
      let _remainingTextNode = document.createTextNode(
        _node.data.substring(0, this.range.startOffset)
      );
      let _sliceTextNode = document.createTextNode(
        _node.data.substring(this.range.startOffset, _node.data.length)
      );
      this.range.selectNode(_node);
      this.selection.getRangeAt(this.range.startOffset);
      this.range.deleteContents();
      this.range.insertNode(_remainingTextNode);
      if (this.range.commonAncestorContainer.nodeName === CONFIG.TAG_ELEMENT) {
        util.insertAfter(_sliceTextNode, this.range.commonAncestorContainer);
        util.insertAfter(_firstElement, this.range.commonAncestorContainer);
      } else {
        util.insertAfter(
          _sliceTextNode,
          this.range.commonAncestorContainer.parentNode
        );
        util.insertAfter(
          _firstElement,
          this.range.commonAncestorContainer.parentNode
        );
      }
      this.range.setStartBefore(_sliceTextNode);
    } else {
      this.range.insertNode(_firstElement);
      this.range.setStartAfter(_firstElement);
    }
  }
  autoComplete(e) {
    let _keyCode = e.which || e.keyCode;
    this.selection = window.getSelection();
    if (this.selection.rangeCount <= 0) {
      return;
    }
    this.range = this.selection.getRangeAt(0);
    this.setTagState();
    if (this.state.isTag) {
      let _txt = String.fromCharCode(e.keyCode) || null;
      if (
        _keyCode === CONFIG.KEYCODE.BACKSPACE ||
        _keyCode === CONFIG.KEYCODE.LEFT ||
        _keyCode === CONFIG.KEYCODE.UP ||
        _keyCode === CONFIG.KEYCODE.RIGHT ||
        _keyCode === CONFIG.KEYCODE.DOWN
      ) {
        if (
          this.range.commonAncestorContainer.parentNode.nodeName.toUpperCase() ===
          CONFIG.TAG_ELEMENT
        ) {
          _txt = this.range.commonAncestorContainer.parentNode.innerHTML.substring(
            0,
            this.range.commonAncestorContainer.parentNode.innerHTML.length - 1
          );
          let _tagElement = this.range.commonAncestorContainer.parentNode;
          this.setPositionLayer(_tagElement);
        }
      } else {
        if (
          this.range.commonAncestorContainer.parentNode.nodeName.toUpperCase() ===
          CONFIG.TAG_ELEMENT
        ) {
          _txt =
            this.range.commonAncestorContainer.parentNode.innerHTML +
            String.fromCharCode(e.keyCode);
          let _tagElement = this.range.commonAncestorContainer.parentNode;
          this.setPositionLayer(_tagElement);
        }
      }
      _txt = _txt.replace(CONFIG.WORDS.HASHTAG, '');
      _txt = _txt.replace(CONFIG.WORDS.MENTION, '');
      _txt = _txt.toLowerCase();
      this.setLayer(_txt);
    }
  }
  setLayer(txt) {
    if (this.state.currentTag === CONFIG.WORDS.HASHTAG) {
      this.layerState.data = Options.getHashData();
    } else if (this.state.currentTag === CONFIG.WORDS.MENTION) {
      this.layerState.data = Options.getMentionData();
    }
    if (txt.length > 0) {
      this.autoData = [];
      this.autoCnt = 0;
      for (let i = 0, j = this.layerState.data.length; i < j; i++) {
        let autoString = this.layerState.data[i].substring(0, txt.length);
        if (autoString.indexOf(txt) !== -1) {
          this.autoData.push(i);
          this.autoCnt++;
        }
      }
      this.renderLayer();
    }
  }
  setPositionLayer(target) {
    const topToBody = util.getTopToBody(target);
    const leftToBody = util.getLeftToBody(target);
    const height = target.offsetHeight;
    const scroll = this.editArea.scrollTop;
    this.autoTarget = target;
    if (this.layer) {
      Object.assign(this.layer.style, {
        top: topToBody + height - scroll + 'px',
        left: leftToBody + 'px',
      });
    }
  }
  renderLayer() {
    let levelCnt = 0;
    this.layer.innerHTML = '';
    for (let i = 0, j = this.autoCnt; i < j; i++) {
      levelCnt = this.autoData[i];
      let element = document.createElement('div');
      element.className = Options.getLayerDataClass();
      element.setAttribute('data-idx', levelCnt);
      element.innerHTML = this.layerState.data[levelCnt];
      element.addEventListener('click', this.onAutoData.bind(this));
      this.layer.appendChild(element);
    }
    if (this.autoCnt !== 0) {
      this.openLayer();
    }
  }
  onAutoData(e) {
    e.preventDefault();
    this.autoTarget.innerHTML = this.state.currentTag + e.target.innerHTML;
    this.editArea.focus();
    window.getSelection().selectAllChildren(this.autoTarget);
    this.selection.removeAllRanges();
    this.range.setStartAfter(this.autoTarget);
    this.selection.addRange(this.range);
    let _firstElement = document.createTextNode('\u00A0');
    this.range.insertNode(_firstElement);
    this.selection.removeAllRanges();
    this.range.setStartAfter(_firstElement);
    this.selection.addRange(this.range);
    this.closeLayer();
  }
  onDocumentKeyUpEvent(e) {
    const _keyCode = e.which || e.keyCode;
    if (this.layerState.isOpen) {
      if (_keyCode === CONFIG.KEYCODE.DOWN) {
        if (this.layerState.idx < this.autoCnt - 1) {
          this.layerState.idx++;
          this.resetLayer();
          this.layer
            .querySelectorAll('.' + Options.getLayerDataClass())
            [this.layerState.idx].classList.add('on');
        }
      } else if (_keyCode === CONFIG.KEYCODE.UP) {
        if (this.layerState.idx > 0) {
          this.layerState.idx--;
          this.resetLayer();
          this.layer
            .querySelectorAll('.' + Options.getLayerDataClass())
            [this.layerState.idx].classList.add('on');
        }
      } else if (_keyCode === CONFIG.KEYCODE.ENTER) {
        this.autoTarget.innerHTML =
          this.state.currentTag +
          this.layer.querySelectorAll('.' + Options.getLayerDataClass())[
            this.layerState.idx
          ].innerHTML;
        window.getSelection().selectAllChildren(this.autoTarget);
        this.selection.removeAllRanges();
        this.range.setStartAfter(this.autoTarget);
        this.selection.addRange(this.range);
        let _firstElement = document.createTextNode('\u00A0');
        this.range.insertNode(_firstElement);
        this.selection.removeAllRanges();
        this.range.setStartAfter(_firstElement);
        this.selection.addRange(this.range);
        this.closeLayer();
      }
    }
  }
  resetLayer() {
    if (this.layer) {
      let datas = this.layer.querySelectorAll(
        '.' + Options.getLayerDataClass()
      );
      for (let i = 0, j = datas.length; i < j; i++) {
        datas[i].classList.remove('on');
      }
    }
  }
  openLayer() {
    if (this.layer) {
      this.layer.style.display = 'block';
      this.layer
        .querySelectorAll('.' + Options.getLayerDataClass())
        [this.layerState.idx].classList.add('on');
      this.layerState.isOpen = true;
    }
  }
  closeLayer() {
    if (this.layer) {
      this.layer.innerHTML = '';
      this.layer.style.display = 'none';
      this.layerState.isOpen = false;
      this.layerState.idx = 0;
    }
  }
}
