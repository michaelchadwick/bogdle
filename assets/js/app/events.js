/* events */
/* adds event listeners to dom */
/* global Bogdle */

Bogdle._onTileClick = function (tile) {
  const tileStatus = tile.target.dataset.state

  if (tileStatus == 'tbd') {
    Bogdle._animateCSS(`#${tile.target.id}`, 'pulse')

    // change tile status
    tile.target.dataset.state = 'selected'

    // push another selected tile onto selected array
    Bogdle.__getConfig().tilesSelected.push(tile.target.dataset.pos)

    // add selected tile to guess
    Bogdle.dom.guess.innerHTML += tile.target.innerHTML

    Bogdle._audioPlay('tile_click')

    // check guess for validity
    Bogdle._checkGuess()
  }
}

// handle both clicks and touches outside of modals
Bogdle._handleClickTouch = function (event) {
  const dialog = document.getElementsByClassName('modal-dialog')[0]
  const elem = event.target

  if (dialog) {
    const isConfirm = dialog.classList.contains('modal-confirm')

    // only close if not a confirmation!
    if (elem == dialog && !isConfirm) {
      dialog.remove()
    }
  }

  if (elem == Bogdle.dom.navOverlay) {
    Bogdle.dom.navOverlay.classList.toggle('show')
  }
}

Bogdle._attachEventListeners = function () {
  // {} header icons to open modals
  Bogdle.dom.interactive.btnNav.addEventListener('click', () => {
    Bogdle.dom.navOverlay.classList.toggle('show')
  })
  Bogdle.dom.interactive.btnNavClose.addEventListener('click', () => {
    Bogdle.dom.navOverlay.classList.toggle('show')
  })
  Bogdle.dom.interactive.btnHelp.addEventListener('click', () => Bogdle.modalOpen('help'))
  Bogdle.dom.interactive.btnStats.addEventListener('click', () => Bogdle.modalOpen('stats'))
  Bogdle.dom.interactive.btnSettings.addEventListener('click', () => Bogdle.modalOpen('settings'))

  // [A] tile interaction
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile) => {
    tile.addEventListener('click', (t) => {
      Bogdle._onTileClick(t)
    })
  })

  // ❔ hint
  Bogdle.dom.interactive.btnHint.addEventListener('click', () => {
    Bogdle._initHint()
  })

  // X hint reset
  Bogdle.dom.interactive.btnHintReset.addEventListener('click', () => {
    Bogdle._clearHint()
  })

  // ✅ submit word
  Bogdle.dom.mainUI.btnSubmit.addEventListener('click', () => {
    Bogdle._submitWord(Bogdle.dom.guess.innerHTML)
  })

  // ⌫ backspace
  Bogdle.dom.mainUI.btnBackspace.addEventListener('click', () => {
    Bogdle.ui._removeLastLetter()
  })

  // X clear
  Bogdle.dom.mainUI.btnClearGuess.addEventListener('click', () => {
    Bogdle.ui._resetInput()
  })

  // 🔀 shuffle
  Bogdle.dom.mainUI.btnShuffle.addEventListener('click', () => {
    Bogdle.ui._shuffleTiles()
  })

  // := show current game word list progress
  Bogdle.dom.mainUI.btnShowProgress.addEventListener('click', () => {
    Bogdle.modalOpen('show-progress')
  })

  // 📕 dictionary lookup
  Bogdle.dom.mainUI.btnGuessLookup.addEventListener('click', () => {
    if (Bogdle.dom.guess.classList.contains('valid')) {
      Bogdle.modalOpen('dictionary')
    }
  })

  // + create new solution
  Bogdle.dom.mainUI.btnCreateNew.addEventListener('click', () => {
    Bogdle._confirmNewFree()
  })

  // local debug buttons
  if (Bogdle.env == 'local') {
    if (Bogdle.dom.interactive.debug.all) {
      // 🪣 show master word list
      Bogdle.dom.interactive.debug.btnShowList.addEventListener('click', () => {
        Bogdle.modalOpen('show-solution')
      })

      // ⚙️ show current bogdle config
      Bogdle.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
        Bogdle.modalOpen('show-config')
      })

      // 🎚️ show current bogdle state
      Bogdle.dom.interactive.debug.btnShowState.addEventListener('click', () => {
        Bogdle.modalOpen('show-state')
      })

      // 🏆 win game immediately
      Bogdle.dom.interactive.debug.btnWinGame.addEventListener('click', () => {
        Bogdle._winGameHax()
      })
      // 🏅 almost win game (post-penultimate move)
      Bogdle.dom.interactive.debug.btnWinGameAlmost.addEventListener('click', () => {
        Bogdle._winGameHax('almost')
      })
      // 🏁 display win tile animation
      Bogdle.dom.interactive.debug.btnWinAnimation.addEventListener('click', () => {
        Bogdle.__winAnimation().then(() => Bogdle.ui._resetTilesDuration())
      })
    }
  }

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'Enter':
        Bogdle._submitWord(Bogdle.dom.guess.innerHTML)
        break
      case 'Escape':
        Bogdle.ui._resetInput()
        break
      case 'Backspace':
      case 'Delete':
        Bogdle.ui._removeLastLetter()
        break
      case 'Space':
        Bogdle.ui._shuffleTiles()
        break
      case 'Slash':
        Bogdle._initHint()
        break
      default: {
        const excludedKeys = ['Alt', 'Control', 'Meta', 'Shift', 'ShiftLeft', 'ShiftRight']
        const validLetters = Bogdle.__getConfig().letters.map((l) => l.toUpperCase())
        const pressedLetter = event.code.charAt(event.code.length - 1)

        if (!excludedKeys.some((key) => event.getModifierState(key))) {
          if (validLetters.includes(pressedLetter)) {
            // find any available tiles to select
            const boardTiles = Array.from(Bogdle.dom.interactive.tiles)

            const availableTiles = boardTiles.filter(
              (tile) => tile.innerHTML.toUpperCase() == pressedLetter && tile.dataset.state == 'tbd'
            )

            // if we found one, select first found
            // this only works in Findle, not Bogdle
            if (availableTiles.length) {
              const tileToPush = availableTiles[0]

              tileToPush.dataset.state = 'selected'

              // push another selected tile onto selected array
              Bogdle.__getConfig().tilesSelected.push(tileToPush.dataset.pos)

              // add selected tile to guess
              Bogdle.dom.guess.innerHTML += tileToPush.innerHTML

              // do a little dance
              Bogdle._animateCSS(`#${tileToPush.id}`, 'pulse')
              Bogdle._audioPlay('tile_click')

              // check guess for validity
              Bogdle._checkGuess()
            }
          }
        }
      }
    }
  })

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Bogdle._handleClickTouch)
  window.addEventListener('touchend', Bogdle._handleClickTouch)

  window.onload = Bogdle.ui._resizeBoard
  window.onresize = Bogdle.ui._resizeBoard

  document.body.addEventListener(
    'touchmove',
    function (event) {
      event.preventDefault
    },
    { passive: false }
  )
}

Bogdle._logStatus('[LOADED] /app/events')
