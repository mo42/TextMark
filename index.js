import {stopwords} from './stopwords.js'

/**
 * Dynamically mark words in a text.
 */
export class TextMark {
  constructor (element, text) {
    var t = this
    t.element = element
    t.text = text
    t.terms = t.text.split(/(\s+)/)
    t.html = ''
    var stopWordSet = new Set(stopwords)
    for (let i in t.terms) {
      let term = t.terms[i]
      let className = t.className(term)
      if (stopWordSet.has(className)) {
        t.html += '<span class="text">' + term + '</span>'
      } else {
        t.html += '<span class="text ' + className + '">' + term + '</span> '
      }
    }
    t.setupClick()
    t.setupSelection()
    t.defaultSelector = 'mark'
  }

  /**
   * This function removes punctuation switches all characters to lower case
   * so that it can be used as a class name.
   */
  className (term) {
    return term.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase()
  }

  setupClick () {
    var t = this
    var click = function (event) {
      let text = event.explicitOriginalTarget.data
      text = t.className(text)
      t.toggleClass(text, t.defaultSelector)
      if (t.clickCallback !== undefined) {
        t.clickCallback(text)
      }
    }
    t.element.addEventListener('click', click, false)
  }

  setupSelection () {
    var t = this
    t.element.innerHTML = t.html
    var select = function () {
      let selection = window.getSelection()
      let selectionString = selection.toString()
      let selectionTerms = selectionString.split(/(\s+)/)
      for (let i in selectionTerms) {
        let term = selectionTerms[i]
        let className = t.className(term)
        t.addClassToClass(className, t.defaultSelector)
      }
      selection.removeAllRanges()
    }
    t.element.addEventListener('mouseup', select, false)
  }

  /**
   * Set a default class selector.
   */
  defaultSelector (defaultSelector) {
    this.defaultSelector = defaultSelector
    return this
  }

  /**
   * Register a callback function that is called if a word has been marked.
   */
  addCallback (addCallback) {
    this.addCallback = addCallback
    return this
  }

  /**
   * Register a callback function that is called if a word has been removed.
   */
  removeCallback (removeCallback) {
    this.removeCallback = removeCallback
    return this
  }

  addClassToElement (element, addClass) {
    element.classList.add(addClass)
  }

  removeClassFromElement (element, removeClass) {
    element.classList.remove(removeClass)
  }

  toggleClassElement (element, toggleClass) {
    return element.classList.toggle(toggleClass)
  }

  addClassToClass (className, addClass) {
    var t = this
    let elements = t.element.getElementsByClassName(className)
    for (let i = 0; i < elements.length; ++i) {
      t.addClassToElement(elements[i], addClass)
    }
    if (elements.length > 0 && t.addCallback !== undefined) {
      t.addCallback(elements[0])
    }
  }

  removeClass (className, removeClass) {
    var t = this
    let elements = t.element.getElementsByClassName(className)
    for (let i = 0; i < elements.length; ++i) {
      t.removeClassFromElement(elements[i], removeClass)
    }
    if (elements.length > 0 && t.removeCallback !== undefined) {
      t.removeCallback(elements[0])
    }
  }

  toggleClass (className, toggleClass) {
    var t = this
    let elements = t.element.getElementsByClassName(className)
    let added = false
    for (let i = 0; i < elements.length; ++i) {
      added = t.toggleClassElement(elements[i], toggleClass)
    }
    if (elements.length > 0 && added && t.addCallback !== undefined) {
      t.addCallback(elements[0])
    } else if (elements.length > 0 && !added &&
        t.removeCallback !== undefined) {
      t.removeCallback(elements[0])
    }
  }

  clear () {
    var t = this
    t.element.innerHTML = t.html
  }
}
