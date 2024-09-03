/* lib/misc/hint */
/* word hint functions */
/* global Bogdle */

Bogdle._initHint = function () {
  if (!Bogdle.__getConfig().hintWord) {
    const wordsLeft = Bogdle.__getUnGuessedWords()
    Bogdle.__setConfig(
      'hintWord',
      wordsLeft[Math.floor(Math.random() * wordsLeft.length)]
    )

    Array.from(Bogdle.__getConfig().hintWord).forEach((l) => {
      Bogdle.__getConfig().hintObscuredWord.push('_')
    })

    Bogdle.dom.interactive.btnHintReset.classList.add('show')

    Bogdle.__getState().hintsUsed++
    Bogdle._saveGame(Bogdle.__getGameMode())
  }

  Bogdle._cycleHint()
}

// continually add letters to hint until max reached
Bogdle._cycleHint = function () {
  // if pressing the '/' key to cycle through hints
  if (Bogdle.dom.interactive.btnHint.classList.contains('not-a-button')) {
    return Bogdle._clearHint()
  }

  const hintWord = Bogdle.__getConfig().hintWord

  // set maximum number of letters to show before forcing a new hint
  const maxLetters = Math.ceil(hintWord.length / 2)

  // if we haven't yet revealed enough letters,
  // change a _ to a letter
  if (Bogdle.__getConfig().hintObscuredWordCounter < maxLetters) {
    let idx = 0
    let foundEmpty = false

    while (!foundEmpty) {
      idx = Math.floor(Math.random() * Bogdle.__getConfig().hintWord.length)

      if (Bogdle.__getConfig().hintWord[idx]) {
        if (Bogdle.__getConfig().hintObscuredWord[idx] == '_') {
          Bogdle.__getConfig().hintObscuredWord[idx] =
            Bogdle.__getConfig().hintWord[idx]
          foundEmpty = true
        }
      }
    }

    Bogdle.dom.interactive.btnHint.innerHTML =
      Bogdle.__getConfig().hintObscuredWord.join('')

    Bogdle.__getConfig().hintObscuredWordCounter++
  }

  if (Bogdle.__getConfig().hintObscuredWordCounter == maxLetters) {
    Bogdle.dom.interactive.btnHint.classList.add('not-a-button')
    Bogdle.dom.interactive.btnHint.setAttribute('disabled', true)
  }
}

// change not-a-button hint back to button hint
Bogdle._clearHint = function () {
  Bogdle.dom.interactive.btnHint.classList.remove('not-a-button')
  Bogdle.dom.interactive.btnHint.removeAttribute('disabled')
  Bogdle.dom.interactive.btnHint.innerHTML = 'HINT?'

  Bogdle.dom.interactive.btnHintReset.classList.remove('show')

  Bogdle.__setConfig('hintWord', null)
  Bogdle.__setConfig('hintObscuredWord', [])
  Bogdle.__setConfig('hintObscuredWordCounter', 0)
}

Bogdle._disableHint = function () {
  Bogdle.dom.interactive.btnHint.disabled = true
}

Bogdle._enableHint = function () {
  Bogdle.dom.interactive.btnHint.disabled = false
}

// get array of words not yet guessed for hint system
Bogdle.__getUnGuessedWords = function () {
  const words = Bogdle.__getConfig().solutionSet
  const wordsLeft = []

  Object.keys(words).forEach((length) => {
    Object.keys(words[length]).forEach((word) => {
      if (!words[length][word]) {
        wordsLeft.push(word)
      }
    })
  })

  return wordsLeft
}
