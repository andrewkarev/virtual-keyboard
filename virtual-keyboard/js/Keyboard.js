/* eslint-disable import/extensions */
import createEl from './utils/helper.js';
import languages from './layouts/languages.js';
import Key from './Key.js';
import { set } from './utils/localStorage.js';
import listItems from './list.js';

export default class Keyboard {
  constructor(keysSequence, language) {
    this.keysSequence = keysSequence;
    this.language = language;
    this.generatedKeys = [];
    this.isCaps = false;
    this.isShift = false;
    this.isControl = false;
  }

  // Basic layout elements creating
  init() {
    const title = createEl('h1', 'title', 'Virtual keyboard');
    const subtitle = createEl('h2', 'description', 'Keyboard was created in Windows operating system');
    const languageOptions = createEl('p', 'language', 'Use <span class="bold">Shift</span> + <span class="bold">Alt</span> to switch language');
    this.textarea = createEl('textarea', 'textarea', null, null, ['cols', 50], ['rows', 5], ['placeholder', 'To see the text output, start typing...'], ['autocorrect', 'off'], ['spellcheck', 'false']);
    this.keyboardContainer = createEl('div', 'keyboard');
    const main = createEl('main', '', [title, subtitle, languageOptions, this.textarea, this.keyboardContainer]);

    const modalWindowList = createEl('ul', 'modal-window__list');
    const modalWindowCloseBtn = createEl('div', 'modal-window__close-btn', '<span class="modal-window__close-btn-text">Okay, I got it!</span>');
    const modalWindowTitle = createEl('h2', ['modal-window__title', 'description'], 'How to use? Press...');
    const modalWindowCard = createEl('div', 'modal-window__card', [modalWindowTitle, modalWindowList, modalWindowCloseBtn]);
    const modalWindow = createEl('div', 'modal-window', modalWindowCard);
    listItems.forEach((item) => {
      createEl('li', 'modal-window__list-item', item, modalWindowList);
    });

    modalWindow.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-window__close-btn-text') || e.target.classList.contains('modal-window')) {
        modalWindow.classList.add('disabled');
      }
    });

    document.body.prepend(modalWindow, main);
    return this;
  }

  // Creating and inserting keyboard keys into keyboard container
  generateKeyboard() {
    this.keysSequence.forEach((row) => {
      const keyboardRow = createEl('div', 'keyboard__row');
      row.forEach((keyCode) => {
        const keyDescription = languages[this.language].find((key) => key.code === keyCode);
        const keyElement = new Key(keyDescription);
        keyboardRow.append(keyElement.symbolsContainer);
        this.generatedKeys.push(keyElement);
      });
      this.keyboardContainer.append(keyboardRow);
    });

    // Adding event listeners
    this.keyboardContainer.addEventListener('mousedown', this.handleEvent);
    this.keyboardContainer.addEventListener('mouseup', this.handleEvent);
    window.addEventListener('keydown', this.handleEvent);
    window.addEventListener('keyup', this.handleEvent);

    // Checking if the cursor is over the key and if not changing the appearance of the key
    this.generatedKeys.forEach((key) => {
      key.symbolsContainer.addEventListener('mouseleave', () => {
        if (!key.code.includes('CapsLock')) key.symbolsContainer.classList.remove('active');
        if (key.code.includes('Shift')) {
          this.eventPhase = 'up';
          this.handleShiftPress();
        }
      });
    });
  }

  // Handling mouse and keyboard actions
  handleEvent = (e) => {
    e.preventDefault();
    this.textarea.focus();
    const eventType = e.type;
    const eventCode = e.code;

    // Geting DOM-element of pressed key
    if (eventType.includes('mouse')) {
      this.pressedKey = e.target.closest('.keyboard__key');
    } else {
      const properKey = this.generatedKeys.find((key) => key.code === eventCode);
      if (properKey) {
        this.pressedKey = properKey.symbolsContainer;
      }
    }

    // Checking if the correct key butoon was pressed
    if (this.pressedKey) {
      // Checking if CapsLock/Shift/Alt was pressed
      const isCapsKey = this.pressedKey.dataset.code.includes('CapsLock');
      const isShiftKey = this.pressedKey.dataset.code.includes('Shift');
      const isAltKey = this.pressedKey.dataset.code.includes('Alt');
      const isControlKey = this.pressedKey.dataset.code.includes('Control');

      // Checking if it was mouseup/keyup or mousedown/keydown
      if (eventType.includes('down')) {
        this.eventPhase = 'down';
        this.pressedKey.classList.add('active');
        if (isCapsKey) this.handleCapsPress();
        if (isAltKey && this.isShift) this.switchLayoutLanguage();
        // Calling printing to output function
        this.print();
      } else if (eventType.includes('up') && !isCapsKey) {
        this.eventPhase = 'up';
        this.pressedKey.classList.remove('active');
      }
      if (isShiftKey) this.handleShiftPress();
      if (isControlKey) this.handleControlPress();
    }
  };

  //  Handling control press
  handleControlPress() {
    if (this.eventPhase === 'down') {
      this.isControl = true;
    } else {
      this.isControl = false;
    }
  }

  // Handling shift press
  handleCapsPress() {
    if (!this.isCaps) {
      this.pressedKey.classList.add('active');
      this.isCaps = true;
    } else {
      this.pressedKey.classList.remove('active');
      this.isCaps = false;
    }
    this.switchLetterCase();
  }

  // Handling CapsLock press
  handleShiftPress() {
    if (this.eventPhase === 'down') {
      this.isShift = true;
    } else {
      this.isShift = false;
    }
    this.switchLetterCase();
  }

  // Switching letter case
  switchLetterCase() {
    this.generatedKeys.forEach((key) => {
      // In case of pressed CapsLock
      if (this.isCaps) {
        if (key.shift && key.shift.match(/[a-zA-Zа-яА-ЯёЁ]/)) {
          // In case of pressed Shift
          if (this.isShift) {
            // If key contains alternative symbol
            if (key.symbolSecondary) {
              key.symbolSecondary.classList.add('inactive');
              key.symbolMain.classList.remove('inactive');
              // If key doesn't contain alternative symbol
            } else if (!key.symbolSecondary) {
              const keyLetter = key.symbolMain;
              keyLetter.textContent = key.symbol;
            }
            // In case of Shift wasn't pressed
          } else if (!this.isShift) {
            // If key contains alternative symbol
            if (key.symbolSecondary) {
              key.symbolSecondary.classList.remove('inactive');
              key.symbolMain.classList.add('inactive');
              // If key doesn't contain alternative symbol
            } else if (!key.symbolSecondary) {
              const keyLetter = key.symbolMain;
              keyLetter.textContent = key.shift;
            }
          }
        }
      }
      // In case of CapsLock wasn't pressed
      if (!this.isCaps) {
        if (key.shift) {
          // If key contains alternative symbol
          if (key.symbolSecondary) {
            // In case of pressed Shift
            if (this.isShift) {
              key.symbolSecondary.classList.remove('inactive');
              key.symbolMain.classList.add('inactive');
              // In case of Shift wasn't pressed
            } else if (!this.isShift) {
              key.symbolSecondary.classList.add('inactive');
              key.symbolMain.classList.remove('inactive');
            }
            // If key doesn't contain alternative symbol
          } else if (!key.symbolSecondary) {
            // In case of Shift wasn't pressed
            if (this.isShift) {
              const keyLetter = key.symbolMain;
              keyLetter.textContent = key.shift;
              // In case of Shift wasn't pressed
            } else if (!this.isShift) {
              const keyLetter = key.symbolMain;
              keyLetter.textContent = key.symbol;
            }
          }
        }
      }
    });
  }

  // Switching language
  switchLayoutLanguage() {
    const languageKeys = Object.keys(languages);
    let currentIndex = languageKeys.indexOf(this.language);

    // Updating language value
    if ((currentIndex + 1) < languageKeys.length) {
      this.language = languageKeys[currentIndex += 1];
    } else {
      this.language = languageKeys[currentIndex -= currentIndex];
    }

    // Saving current language code to the local storage
    set('lang', languageKeys[currentIndex]);

    const keyDescription = languages[this.language];
    // Changing keys symbols
    this.generatedKeys.forEach((elem) => {
      const keyAlt = keyDescription.find((el) => el.code === elem.code);
      const currentKey = elem;
      currentKey.symbol = keyAlt.symbol;
      currentKey.shift = keyAlt.shift;

      // if key both contain alternative symbol and not depending on the layout
      if (elem.code.match(/(Semicolon|Quote|Period|Comma)/)) {
        if (languageKeys[currentIndex] === 'en') {
          currentKey.symbolSecondary = createEl('p', ['symbol-secondary', 'inactive'], currentKey.shift);
          currentKey.symbolsContainer.prepend(currentKey.symbolSecondary);
        } else {
          currentKey.symbolSecondary.remove();
          delete currentKey.symbolSecondary;
          currentKey.symbolMain.classList.remove('inactive');
        }
      }
      // If key contains alternative symbol
      if (elem.symbolSecondary) {
        currentKey.symbolSecondary.innerHTML = elem.shift;
      }

      currentKey.symbolMain.innerHTML = elem.symbol;
    });

    // If Shift/CapsLock were pressed while switching language, runing case switching function
    this.switchLetterCase();
  }

  // Print symbols to the output textarea
  print() {
    const currentPressedKey = this.pressedKey.dataset.code;
    const currentKeyObj = this.generatedKeys.find((key) => key.code === currentPressedKey);
    // PArt of the textarea content before the caret
    const left = this.textarea.value.slice(0, this.textarea.selectionStart);
    // PArt of the textarea content after the caret
    const right = this.textarea.value.slice(this.textarea.selectionStart);
    // Maximum textarea line size
    const TEXTAREA_LINE_LENGTH = 72;
    // Saving current caret 'start' position
    let caretPosition = this.textarea.selectionStart;

    // If pressed key isn't functional
    if (currentKeyObj.shift) {
      // Checking if any functioanal key was alreade pressed
      if (this.isShift && this.isCaps) {
        if (caretPosition !== this.textarea.selectionEnd) {
          this.textarea.setRangeText(currentKeyObj.symbol);
        } else {
          this.textarea.value = `${left}${currentKeyObj.symbol}${right}`;
        }
      } else if (this.isShift) {
        if (caretPosition !== this.textarea.selectionEnd) {
          this.textarea.setRangeText(currentKeyObj.shift);
        } else {
          this.textarea.value = `${left}${currentKeyObj.shift}${right}`;
        }
      } else if (this.isCaps) {
        if (currentKeyObj.symbol.match(/[a-zA-Zа-яА-ЯёЁ]/)) {
          if (caretPosition !== this.textarea.selectionEnd) {
            this.textarea.setRangeText(currentKeyObj.shift);
          } else {
            this.textarea.value = `${left}${currentKeyObj.shift}${right}`;
          }
        } else if (!currentKeyObj.symbol.match(/[a-zA-Zа-яА-ЯёЁ]/)) {
          if (caretPosition !== this.textarea.selectionEnd) {
            this.textarea.setRangeText(currentKeyObj.symbol);
          } else {
            this.textarea.value = `${left}${currentKeyObj.symbol}${right}`;
          }
        }
      } else if (!this.isShift && !this.isCaps) {
        if (caretPosition !== this.textarea.selectionEnd) {
          this.textarea.setRangeText(currentKeyObj.symbol);
        } else {
          this.textarea.value = `${left}${currentKeyObj.symbol}${right}`;
        }
      }
      caretPosition += 1;
      // If pressed key is functional
    } else {
      switch (currentPressedKey) {
        // appropriate case would work according to pressed key
        case 'Delete':
          if (caretPosition !== this.textarea.selectionEnd) {
            this.textarea.setRangeText('');
          } else {
            this.textarea.value = `${left}${right.slice(1)}`;
          }
          break;
        case 'Tab':
          if (caretPosition !== this.textarea.selectionEnd) {
            this.textarea.setRangeText('    ');
          } else {
            this.textarea.value = `${left}    ${right}`;
          }
          caretPosition += 4;
          break;
        case 'Backspace':
          if (caretPosition !== this.textarea.selectionEnd) {
            this.textarea.setRangeText('');
          } else if (!this.caretEnd) {
            if (caretPosition > 0) {
              this.textarea.value = `${left.slice(0, -1)}${right}`;
              caretPosition -= 1;
            }
          }
          break;
        case 'Enter':
          if (caretPosition !== this.textarea.selectionEnd) {
            this.textarea.setRangeText('\n');
          } else {
            this.textarea.value = `${left}\n${right}`;
          }
          caretPosition += 1;
          break;
        case 'Space':
          if (caretPosition !== this.textarea.selectionEnd) {
            this.textarea.setRangeText(' ');
          } else {
            this.textarea.value = `${left} ${right}`;
          }
          caretPosition += 1;
          break;
        case 'ArrowUp':
          /* if current caret position is less then maximum textarea line
           size and doesn't include line break character before current caret position */
          if (caretPosition <= TEXTAREA_LINE_LENGTH && !left.match(/[\n]/)) {
            caretPosition = 0;
            /* if if current caret position is bigger then maximum textarea line
            size and doesn't include line break character before current caret position */
          } else if (caretPosition > TEXTAREA_LINE_LENGTH && !left.match(/[\n]/)) {
            caretPosition -= TEXTAREA_LINE_LENGTH;
            // if textarea content include line break character before current caret position
          } else if (left.match(/[\n]/)) {
            const textAreaLines = left.split('\n');
            const leftElem0 = textAreaLines[textAreaLines.length - 1].length;
            const leftElem1 = textAreaLines[textAreaLines.length - 2].length;
            const indent = textAreaLines.slice(0, textAreaLines.length - 2).join('').length;
            const additionslIndent = leftElem0 < leftElem1 ? leftElem0 : leftElem1;
            const lineFeeds = left.split('\n').length - 1;
            caretPosition = indent + additionslIndent + lineFeeds - 1;
          }
          break;
        case 'ArrowDown':
          /* if textarea content length less then maximum textarea line
           size and doesn't include line break character after current caret position */
          if (this.textarea.value.length <= TEXTAREA_LINE_LENGTH && !right.match(/[\n]/)) {
            caretPosition = this.textarea.value.length;
            /* if textarea content length bigger then maximum textarea line
            size and doesn't include line break character after current caret position */
          } else if (this.textarea.value.length > TEXTAREA_LINE_LENGTH && !right.match(/[\n]/)) {
            caretPosition += TEXTAREA_LINE_LENGTH;
            // if textarea content include line break character
          } else if (right.match(/[\n]/)) {
            const rightElem0 = right.split('\n')[0];
            const leftSubStr = left.split('\n').reverse()[0].length;
            const rightElem1 = right.split('\n')[1].length;
            if (!rightElem0) {
              caretPosition += rightElem1 < leftSubStr
                ? rightElem1 + rightElem0.length + 1
                : leftSubStr + 1;
            } else {
              caretPosition += rightElem0.length + leftSubStr + 1;
            }
          }
          break;
        case 'ArrowLeft':
          /* If shift key was pressed we have to highlight letter or word previous to the caret.
          And here we create end point of the text selection.
          But do it only on first press */
          if (this.isShift && !this.caretEnd) {
            this.caretEnd = caretPosition;
          }

          // If control key was pressed we have to move caret to the start of the word
          if (this.isControl) {
            const components = left.split(' ').reverse();
            const step = components.find((el) => el.length !== 0);
            const additionalStep = components.indexOf(step) === -1 ? 0 : components.indexOf(step);
            caretPosition -= ((step ? step.length : 0) + additionalStep);
            // Just change caret position
          } else {
            caretPosition = caretPosition - 1 > 0 ? caretPosition - 1 : 0;
          }
          break;
        case 'ArrowRight':
          /* If shift key was pressed we have to highlight letter or word next to the caret.
          And here we create start and end points of the text selection.
          But do it only on first press */
          if (this.isShift && !this.caretEnd) {
            this.caretEnd = caretPosition;
            this.caretStart = caretPosition;
          }

          // If control key was pressed we have to move caret to the end of the word
          if (this.isControl) {
            const components = right.split(' ');
            const step = components.find((el) => el.length !== 0);
            const additionalStep = components.indexOf(step) === -1 ? 0 : components.indexOf(step);

            if (this.isShift) {
              if (this.caretEnd < this.textarea.value.length) {
                this.caretEnd += (step ? step.length : 0) + additionalStep;
              }
            } else {
              caretPosition += (step ? step.length : 0) + additionalStep;
            }
            /* If control key wasn't pressed we just change caret
             position according to the shift key status */
          } else if (!this.isControl) {
            if (this.isShift) {
              // If shift key was pressed we have to update text selection endpoint on every press
              if (typeof this.caretEnd === 'number' && (this.caretEnd < this.textarea.value.length)) {
                this.caretEnd += 1;
              }
            } else {
              caretPosition += 1;
            }
          }
          break;
        default:
          break;
      }
    }

    // if shift key wasn't pressed we don't need additional points for text selection
    if (!this.isShift) {
      this.caretEnd = null;
      this.caretStart = null;
    }

    // Seting the caret position according to the pressed keys
    this.textarea.setSelectionRange(this.caretStart === null
      ? caretPosition
      : this.caretStart, this.caretEnd || caretPosition);
  }
}
