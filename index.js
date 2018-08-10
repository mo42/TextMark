import * as d3 from 'd3'

import {stopwords} from './stopwords.js'

/**
 * This class allows you to dynamically select words in a text. The basic idea
 * is that a text is divided into words and each word is provided with a class
 * derived from the word itself. Clicking on words applies CSS to the class of
 * the word and invokes callback functions.
 */
export default class TextMark {
  constructor (element, text, textSelector) {
    let t = this
    t.element = element
    t.text = text
    t.textSelector = textSelector || 'text'
    t.terms = t.text.split(/(\s+)/)
    t.html = ''
    let stopWordSet = new Set(stopwords)
    for (let i = 0; i < t.terms.length; ++i) {
      let term = t.terms[i]
      let className = t.className(term)
      if (stopWordSet.has(className)) {
        t.html += '<span class="text">' + term + '</span>'
      } else {
        t.html += '<span class="' + t.textSelector + ' ' + className + '">' +
          term + '</span> '
      }
    }
    t.setupLeftClick()
    t.setupRightClick()
    t.setupSelection()
    t.leftSelector = 'leftSelector'
    t.rightSelector = 'rightSelector'
    t.left = {add: undefined, remove: undefined}
    t.right = {add: undefined, remove: undefined}
  }

  /**
   * This function removes punctuation switches all characters to lower case
   * so that it can be used as a class name.
   */
  className (term) {
    return term.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase()
  }

  setupLeftClick () {
    let t = this
    let click = function (event) {
      let text = t.className(event.explicitOriginalTarget.data)
      t.toggleClass(text, t.leftSelector, t.left)
    }
    t.element.addEventListener('click', click, false)
  }

  setupRightClick () {
    let t = this
    let rightClick = function (event) {
      event.preventDefault()
      let text = t.className(event.explicitOriginalTarget.data)
      t.toggleClass(text, t.rightSelector, t.right)
    }
    t.element.addEventListener('contextmenu', rightClick, false)
  }

  setupSelection () {
    let t = this
    t.element.innerHTML = t.html
    let select = function () {
      let selection = window.getSelection()
      let selectionString = selection.toString()
      let selectionTerms = selectionString.split(/(\s+)/)
      for (let i in selectionTerms) {
        let term = selectionTerms[i]
        let className = t.className(term)
        t.addClass(className, t.leftSelector, t.left)
      }
      selection.removeAllRanges()
    }
    t.element.addEventListener('mouseup', select, false)
  }

  /**
   * Set the selector for the left-click or selection.
   */
  setLeftSelector (leftSelector) {
    this.leftSelector = leftSelector
    return this
  }

  /**
   * Set the selector for the right-click.
   */
  setRightSelector (rightSelector) {
    this.rightSelector = rightSelector
    return this
  }

  /**
   * Register a callback function that is invoked when a word has been added
   * with a left-click.
   */
  leftAddCallback (leftAddCallback) {
    this.left.add = leftAddCallback
    return this
  }

  /**
   * Register a callback function that is invoked when a word has been removed
   * with a left-click.
   */
  leftRemoveCallback (leftRemoveCallback) {
    this.left.remove = leftRemoveCallback
    return this
  }

  /**
   * Register a callback function that is invoked when a word has been added
   * with a right-click.
   */
  rightAddCallback (rightAddCallback) {
    this.right.add = rightAddCallback
    return this
  }

  /**
   * Register a callback function that is invoked when a word has been removed
   * with a right-click.
   */
  rightRemoveCallback (rightRemoveCallback) {
    this.right.remove = rightRemoveCallback
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

  /**
   * This function adds the class in addClass to all elements that have
   * contain className. This function invokes the corresponding callback once.
   */
  addClass (className, addClass, callbacks) {
    let t = this
    let elements = t.element.getElementsByClassName(className)
    for (let i = 0; i < elements.length; ++i) {
      t.addClassToElement(elements[i], addClass)
    }
    if (callbacks !== undefined) {
      if (elements.length > 0 && callbacks.add !== undefined) {
        callbacks.add(elements[0])
      }
    }
  }

  /**
   * This function removes the class in removeClass from all elements that
   * contain className. This function invokes the corresponding callback once.
   */
  removeClass (className, removeClass, callbacks) {
    let t = this
    let elements = t.element.getElementsByClassName(className)
    for (let i = 0; i < elements.length; ++i) {
      t.removeClassFromElement(elements[i], removeClass)
    }
    if (callbacks !== undefined) {
      if (elements.length > 0 && callbacks.remove !== undefined) {
        callbacks.remove(elements[0])
      }
    }
  }

  /**
   * This function toggles the class from toggleClass in all elements with
   * className. The third arguments should, if provided, contain two callback
   * functions ('add' and 'remove') that are called once depending on the
   * toggle result.
   */
  toggleClass (className, toggleClass, callbacks) {
    let t = this
    let elements = t.element.getElementsByClassName(className)
    let added = false
    for (let i = 0; i < elements.length; ++i) {
      added = t.toggleClassElement(elements[i], toggleClass)
    }
    if (callbacks !== undefined) {
      if (elements.length > 0 && added && callbacks.add !== undefined) {
        callbacks.add(elements[0])
      } else if (elements.length > 0 && !added &&
        callbacks.remove !== undefined) {
        callbacks.remove(elements[0])
      }
    }
  }

  /**
   * Remove a given selector from all elements. Without the selector all marks
   * are removed.
   */
  clear (selector) {
    let t = this
    if (selector !== undefined) {
      t.removeClass('text', selector)
    } else {
      t.element.innerHTML = t.html
    }
  }
}

const SNIPPET = 81

/**
 * This class allows you to dynamically select words in a text. In contrast to
 * TextMark, this class is intended for long texts. There is a visualization
 * next to the scrollbar that highlights the occurrences in the text.
 */
export default class TextMap {

  constructor (textSelector, mapSelector, tooltipSelector, text) {
    let t = this
    t.textSelector = textSelector
    t.mapSelector = mapSelector
    t.text = text
    d3.select(t.textSelector).selectAll('*').remove()
    d3.select(t.mapSelector).selectAll('*').remove()
    t.prepareText()
    t.prepareMap()
    t.prepareTooltip(tooltipSelector)
  }

  /**
   * Return an array of all positions in the string that match the given
   * keyword.
   * @param keyword to be highlighted
   * @returns {Object} split text and matching positions
   */
  static indices (text, keyword) {
    let re = new RegExp(keyword, 'gi')
    let matchPositions = []
    while (re.exec(text) !== null) {
      matchPositions.push(re.lastIndex)
    }
    let splitText = text.split(re)
    return {splitText: splitText, indices: matchPositions}
  }

  /**
   * Prepare full text view
   */
  prepareText () {
    let t = this
    d3.select(t.textSelector)
      .style('background-color', 'white')
      .text(t.text)
  }

  /**
   * Prepare map view
   */
  prepareMap () {
    let t = this
    t.mapHeight = +d3.select(t.mapSelector)
      .style('height')
      .slice(0, -2)
    t.mapWidth = 17
    t.mapScale = d3.scaleLinear()
      .domain([0, t.text.length])
      .range([t.mapWidth, t.mapHeight - t.mapWidth])
    t.mapSVG = d3.select(t.mapSelector).append('svg')
      .attr('height', t.mapHeight)
      .attr('width', t.mapWidth)
    t.mapSVG.append('rect')
      .attr('class', 'background')
      .attr('x', 0)
      .attr('y', t.mapWidth)
      .attr('width', t.mapWidth)
      .attr('height', t.mapHeight - t.mapWidth)
      .attr('fill', 'white')
  }

  prepareTooltip (tooltipSelector) {
    let t = this
    t.tooltipSelector = tooltipSelector
    t.tooltip = d3.select(tooltipSelector)
      .attr('opacity', 0)
  }

  /**
   * Highlight all occurrences of the given keyword in the text and in the
   * map.
   * @param keyword to be highlighted
   * @param color of the highlighted keyword
   */
  highlight (keyword, color) {
    if (color === undefined) {
      color = 'red'
    }
    let t = this
    let split = TextMap.indices(t.text, keyword)
    // Show highlights in the map
    let updateSelection = t.mapSVG.selectAll('.map')
      .data(split.indices)
    updateSelection.exit().remove()
    updateSelection.transition()
      .attr('y', function (d) { return t.mapScale(d) })
    updateSelection.enter()
      .append('a')
      .attr('href', function (d) { return t.textSelector + '-' + d })
      .append('rect')
      .attr('class', 'map')
      .attr('x', 0)
      .attr('y', function (d) { return t.mapScale(d) })
      .attr('width', t.mapWidth)
      .attr('height', 1)
      .attr('fill', color)
      .on('mouseover', function (d) {
        t.tooltip.transition().duration(200)
          .style('opacity', 0.9)
        t.tooltip.html(t.textSnippet(d, keyword, color))
          .style('left', (d3.event.pageX + 10) + 'px')
          .style('top', (d3.event.pageY) + 'px')
      }).on('mousemove', function () {
      t.tooltip.style('top', (d3.event.pageY) + 'px')
    }).on('mouseleave', function () {
      t.tooltip.style('opacity', '0.0')
    }).on('mouseleave', function () {
      t.tooltip.style('opacity', '0.0')
    })
    // Highlight words in the text
    let text = ''
    let selector = t.textSelector.slice(1)
    for (let i = 0; i < split.splitText.length; ++i) {
      text += split.splitText[i] + '<span style="background-color: '
        + color + ';" id="' + selector + '-' + split.indices[i] + '">'
        + keyword + '</span>'
    }
    d3.select(t.textSelector).selectAll('div').remove()
    d3.select(t.textSelector).html(text)
  }

  /**
   * Return HTML code of a snippet around the given position
   * @param position in the text
   * @param keyword at the position
   * @param color of the keyword in the snippet
   * @returns {*} HTML string
   */
  textSnippet (position, keyword, color) {
    let t = this
    let snippet = t.text.slice(position - SNIPPET, position + SNIPPET)
    let split = TextMap.indices(snippet, keyword)
    let joinString = '<span style="background-color: ' + color + ';">' + keyword + '</span>'
    return split.splitText.join(joinString)
  }
}
