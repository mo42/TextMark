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
    for (let i in t.terms) {
      let term = t.terms[i]
      let className = t.className(term)
      t.html += '<span class="text ' + className + '">' + term + '</span> '
    }
    t.setupClick()
    t.setupSelection()
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
      t.toggleClass(text, 'mark')
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
        t.addClassToClass(className, 'mark')
      }
      selection.removeAllRanges()
    }
    t.element.addEventListener('mouseup', select, false)
  }

  /**
   * Register a callback function that is called if a word has been marked.
   */
  setClickCallback (clickCallback) {
    var t = this
    t.clickCallback = clickCallback
    return t
  }

  addClassToElement (element, addClass) {
    var t = this
    element.classList.add(addClass)
    if (t.clickCallback !== undefined) t.clickCallback(element)
  }

  removeClassFromElement (element, removeClass) {
    var t = this
    element.classList.remove(removeClass)
    if (t.clickCallback !== undefined) t.clickCallback(element)
  }

  toggleClassElement (element, toggleClass) {
    var t = this
    element.classList.toggle(toggleClass)
    if (t.clickCallback !== undefined) t.clickCallback(element)
  }

  addClassToClass (className, addClass) {
    var t = this
    let elements = t.element.getElementsByClassName(className)
    for (let i = 0; i < elements.length; ++i) {
      t.addClassToElement(elements[i], addClass)
    }
  }

  removeClass (className, removeClass) {
    var t = this
    let elements = t.element.getElementsByClassName(className)
    for (let i = 0; i < elements.length; ++i) {
      t.removeClassFromElement(elements[i], removeClass)
    }
  }

  toggleClass (className, toggleClass) {
    var t = this
    let elements = t.element.getElementsByClassName(className)
    for (let i = 0; i < elements.length; ++i) {
      t.toggleClassElement(elements[i], toggleClass)
    }
  }

  clear () {
    var t = this
    t.element.innerHTML = t.html
  }
}
