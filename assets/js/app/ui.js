/* lib/misc/ui */
/* functions that update the UI */
/* global Bogdle */

Bogdle.ui = {}

// reset UI tiles to default state
Bogdle.ui._resetInput = function () {
  if (Bogdle.__getState().gameState == 'IN_PROGRESS') {
    Bogdle.ui._resetTiles()

    Bogdle._enableHint()

    Bogdle.ui._resetGuess()
  }
}
// set all tiles back to 'tbd'
Bogdle.ui._resetTiles = function () {
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile) => {
    tile.dataset.state = 'tbd'
  })
}
// blank out the current DOM guess div
Bogdle.ui._resetGuess = function () {
  Bogdle.dom.guess.innerHTML = ''
  Bogdle.dom.guess.classList.remove('valid')
  Bogdle.dom.interactive.btnGuessLookup.disabled = true
}

Bogdle.ui._disableUITiles = function () {
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile) => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}
Bogdle.ui._disableUIButtons = function () {
  Object.values(Bogdle.dom.mainUI).forEach((btn) => {
    if (!btn.dataset.permanent) {
      btn.setAttribute('disabled', '')
    }

    if (Bogdle.__getGameMode() == 'free' && btn.id == 'button-create-new') {
      btn.removeAttribute('disabled')
    }
  })
}
Bogdle.ui._enableUIButtons = function () {
  Object.values(Bogdle.dom.mainUI).forEach((btn) => {
    if (btn.id !== 'button-show-progress') {
      btn.removeAttribute('disabled')
    }
  })
}

Bogdle.ui._fillTiles = function () {
  const letters = Bogdle.__getConfig().letters

  // fill UI tiles with letters
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile, i) => {
    tile.innerHTML = letters[i]
  })
}

// randomize the order of tiles
Bogdle.ui._shuffleTiles = function () {
  let letters = Bogdle.__getConfig().letters

  // shuffle order of letters
  let j, x, index
  for (index = letters.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1))
    x = letters[index]
    letters[index] = letters[j]
    letters[j] = x
  }

  Bogdle.ui._fillTiles()

  // make sure game is playable again
  Bogdle.ui._resetInput()
}

Bogdle.ui._resetTilesDuration = function () {
  Array.from(Bogdle.dom.interactive.tiles).forEach(
    (tile) => tile.style.setProperty('--animate-duration', '75ms'),
    0
  )
}

// remove last letter in DOM guess div
Bogdle.ui._removeLastLetter = function () {
  if (Bogdle.__getState().gameState == 'IN_PROGRESS') {
    // remove last position from selected array
    if (Bogdle.__getConfig().tilesSelected.length) {
      const last = Bogdle.__getConfig().tilesSelected.pop()

      Array.from(Bogdle.dom.interactive.tiles).forEach((tile) => {
        if (tile.dataset.pos == last) {
          tile.dataset.state = 'tbd'

          Bogdle._animateCSS(`#${tile.id}`, 'pulse')
        }
      })
    }

    // remove last letter of active guess
    if (Bogdle.dom.guess.innerHTML.length) {
      Bogdle.dom.guess.innerHTML = Bogdle.dom.guess.innerHTML.slice(
        0,
        Bogdle.dom.guess.innerHTML.length - 1
      )

      Bogdle._audioPlay('tile_delete')

      Bogdle._checkGuess()
    }
  }
}

// dynamically resize board depending on viewport
Bogdle.ui._resizeBoard = function () {
  const boardContainer = document.querySelector('#board-container')
  const board = document.querySelector('#board')
  const shortestDim = Math.min(Math.floor(boardContainer.clientHeight + 110), 350)
  const tileHeight = 2 * Math.floor(shortestDim / 3)
  const boardHeight = document.body.clientHeight >= 500 ? tileHeight : tileHeight * 0.85
  const boardWidth = document.body.clientHeight >= 500 ? shortestDim : shortestDim * 0.75

  Bogdle._logStatus(
    `_resizeBoard:\n\tviewp: ${document.body.clientWidth} W x ${
      document.body.clientHeight
    } H,\n\tboard: ${board.clientWidth} W x ${board.clientHeight} H,\n\ttiles: ${
      tileHeight / 3
    } W x ${tileHeight / 3} H`
  )

  document.querySelector('#board').style.height = `${boardHeight}px`
  document.querySelector('#board').style.width = `${boardWidth}px`
}

Bogdle.ui._increaseScore = function () {
  const curGuessed = parseInt(Bogdle.dom.scoreGuessed.innerHTML)

  Bogdle.dom.scoreGuessed.innerHTML = (curGuessed + 1).toString()
}
Bogdle.ui._setScore = function (guessed = 0) {
  Bogdle.dom.scoreGuessed.innerHTML = guessed.toString()
  Bogdle.dom.scoreGuessedOf.innerHTML = ' of '
  Bogdle.dom.scoreTotal.innerHTML = Bogdle.__getSolutionSize().toString()
  Bogdle.dom.scoreTotalWords.innerHTML = ' words'
}

Bogdle.ui._removeModalVestige = () => {
  const dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    dialog.remove()
  }

  if (Bogdle.myModal) {
    Bogdle.myModal._destroyModal()
  }
}

Bogdle._logStatus('[LOADED] /app/ui')
