/* eslint-disable import/extensions */
import createEl from './utils/helper.js';

export default class Key {
  constructor({ symbol, shift, code }) {
    this.symbol = symbol;
    this.shift = shift;
    this.code = code;

    if (this.shift && this.symbol.match(/[`|0-9|\-|=|\\|;|'|,|.|/]/)) {
      this.symbolSecondary = createEl('p', ['symbol-secondary', 'inactive'], this.shift);
    }

    this.symbolMain = createEl('p', 'symbol', this.symbol);
    const childrens = this.symbolSecondary ? [this.symbolSecondary, this.symbolMain]
      : this.symbolMain;
    this.symbolsContainer = createEl('div', 'keyboard__key', childrens, null, ['code', this.code]);
  }
}
