# TextMark
This class allows you to dynamically select words in a text. The basic idea
is that a text is divided into words and each word is provided with a class
derived from the word itself. Clicking on words applies CSS to the class of
the word and invokes callback functions.
## Quick Start
First, create a TextMark object with a container for the text and the text
itself:
```javascript
let textMark = new TextMark(textContainer, text)
```
Then, one can define CSS selectors and callback functions:
```
// Set a CSS selector that specifies how the element is marked
textMark.setLeftSelector('mark')
// Set function that gets invoked on a left-click
textMark.leftAddCallback(somecallback)
```
One can mark words manually too:
```
textMark.addClass(someterm, 'mark')
```
## Reference
TODO