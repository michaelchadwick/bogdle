/* hint */
/* word hint functions */
/* global Bogdle */

// initialize hint system when button clicked
Bogdle._initHint = function() {
  if (!Bogdle.config[Bogdle.__getGameMode()].hintWord) {
    const wordsLeft = Bogdle.__getUnGuessedWords()
    Bogdle.config[Bogdle.__getGameMode()].hintWord = wordsLeft[Math.floor(Math.random() * wordsLeft.length)]

    Array.from(Bogdle.config[Bogdle.__getGameMode()].hintWord).forEach(l => {
      Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord.push('_')
    })

    Bogdle.dom.interactive.btnHintReset.classList.add('show')

  }

  Bogdle._cycleHint()
}
// continually add letters to hint until max reached
Bogdle._cycleHint = function() {
  // if pressing the '/' key to cycle through hints
  if (Bogdle.dom.interactive.btnHint.classList.contains('not-a-button')) {
    return Bogdle._clearHint()
  }

  const hintWord = Bogdle.config[Bogdle.__getGameMode()].hintWord

  // set maximum number of letters to show before forcing a new hint
  var maxLetters = Math.ceil(hintWord.length / 2)

  // if we haven't yet revealed enough letters,
  // change a _ to a letter
  if (Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter < maxLetters) {
    let idx = 0
    let foundEmpty = false

    while (!foundEmpty) {
      idx = Math.floor(Math.random() * Bogdle.config[Bogdle.__getGameMode()].hintWord.length)

      if (Bogdle.config[Bogdle.__getGameMode()].hintWord[idx]) {
        if (Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord[idx] == '_') {
          Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord[idx] = Bogdle.config[Bogdle.__getGameMode()].hintWord[idx];
          foundEmpty = true
        }
      }
    }

    Bogdle.dom.interactive.btnHint.innerHTML = Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord.join('')

    Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter++
  }

  if (Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter == maxLetters) {
    Bogdle.dom.interactive.btnHint.classList.add('not-a-button')
    Bogdle.dom.interactive.btnHint.setAttribute('disabled', true)
  }
}
// change not-a-button hint back to button hint
Bogdle._clearHint = function() {
  Bogdle.dom.interactive.btnHint.classList.remove('not-a-button')
  Bogdle.dom.interactive.btnHint.removeAttribute('disabled')
  Bogdle.dom.interactive.btnHint.innerHTML = 'HINT?'

  Bogdle.dom.interactive.btnHintReset.classList.remove('show')

  Bogdle.config[Bogdle.__getGameMode()].hintWord = null
  Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord = []
  Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter = 0
}
