class Options {
  constructor() {
    this.options = {
      hashClass: 'hash',
      mentionClass: 'mention',
      editorClass: '__editor',
      layerClass: '__layer',
      layerDataClass: '__layer_data',
      hashData: [],
      mentionData: [],
      target: null,
    };
  }
  setDatas(datas) {
    Object.assign(this.options, datas);
  }
  getHashClass() {
    return this.options.hashClass;
  }
  getMentionClass() {
    return this.options.mentionClass;
  }
  getEditorClass() {
    return this.options.editorClass;
  }
  getLayerClass() {
    return this.options.layerClass;
  }
  getLayerDataClass() {
    return this.options.layerDataClass;
  }
  getHashData() {
    return this.options.hashData;
  }
  getMentionData() {
    return this.options.mentionData;
  }
  getTarget() {
    return this.options.target;
  }
}
export default new Options();
