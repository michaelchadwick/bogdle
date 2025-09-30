/* main */
/* app entry point and main functions */
/* global Bogdle */

Bogdle.minWordLength = 4

// settings: saved in LOCAL STORAGE
Bogdle.settings = BOGDLE_DEFAULT_SETTINGS

// config: only saved while game is loaded
Bogdle.config = BOGDLE_DEFAULTS.config

// state: saved between sessions in LOCAL STORAGE
Bogdle.state = BOGDLE_DEFAULTS.state

/*************************************************************************
 * public methods *
 *************************************************************************/

// start the engine
Bogdle.initApp = async () => {
  // if local dev, show debug stuff
  if (Bogdle.env == 'local') {
    Bogdle._initDebug()

    if (!document.title.includes('(LH) ')) {
      document.title = '(LH) ' + document.title
    }
  }
  // if loading from omni.neb.host
  if (document.referrer.indexOf('omni.neb.host') >= 0) {
    Bogdle._clearLocalStorage(false)
  }

  Bogdle._getNebyooApps()

  Bogdle._loadGame()

  Bogdle._attachEventListeners()

  Bogdle._logStatus('[LOADED] /app/main')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// initialize seedWordsFile to pull initial seedWord from
Bogdle._initSeedWordsFile = function (gameMode) {
  Bogdle.__setConfig('seedWordsFile', BOGDLE_DICT_FILE_ROOT, gameMode)

  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  if (gameMode == 'free') {
    Bogdle.__getConfig(gameMode).seedWordsFile +=
      BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY[Bogdle.__getState('free').difficulty]]
  } else {
    // 'daily' is always 'normal' difficulty
    Bogdle.__getConfig(gameMode).seedWordsFile += BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY['normal']]
  }

  Bogdle.__getConfig(gameMode).seedWordsFile += `/words_9-9.json`
}

// initialize dictionary to find words for solutionSet
Bogdle._initDictionaryFile = function (gameMode) {
  let dictFilePath = BOGDLE_DICT_FILE_ROOT

  if (gameMode == 'free') {
    dictFilePath += BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY[Bogdle.__getState(gameMode).difficulty]]
  } else {
    // 'daily' is always 'normal' difficulty
    dictFilePath += BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY['normal']]
  }

  dictFilePath += `/words_4-${Bogdle.__getMaxWordLength()}.json`

  Bogdle.__setConfig('dictionary', dictFilePath, gameMode)
}

// create new solutionSet, which resets progress
Bogdle._createNewSolutionSet = async function (gameMode, newWord = null) {
  // set config to defaults
  Bogdle.__setConfig('letters', [], gameMode)
  Bogdle.__setConfig('tilesSelected', [], gameMode)

  // daily
  if (gameMode == 'daily') {
    Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_9, gameMode)
  }
  // free
  else {
    switch (BOGDLE_DIFF_TO_LENGTH[parseInt(Bogdle.difficulty)]) {
      case 5:
        Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_5, gameMode)
        break
      case 7:
        Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_7, gameMode)
        break
      case 9:
      default:
        Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_9, gameMode)
        break
    }
  }

  // set state to defaults
  Bogdle.__setState('gameState', 'IN_PROGRESS', gameMode)
  Bogdle.__setState('gameWon', false, gameMode)
  Bogdle.__setState('guessedWords', [], gameMode)
  Bogdle.__setState('hintsUsed', 0, gameMode)
  Bogdle.__setState('lastCompletedTime', null, gameMode)
  Bogdle.__setState('lastPlayedTime', null, gameMode)
  Bogdle.__setState('pangramFound', false, gameMode)

  // initialize appropriate dictionary and seed words files
  Bogdle._initDictionaryFile(gameMode)
  Bogdle._initSeedWordsFile(gameMode)

  // 'daily' always uses day hash for seed word
  if (gameMode == 'daily') {
    try {
      const response = await fetch(BOGDLE_DAILY_SCRIPT)
      const data = await response.json()
      newWord = data['word']

      Bogdle.__updateDailyDetails(data['index'])

      if (!newWord) {
        console.error('daily word went bork', newWord)
      }
    } catch (e) {
      console.error('could not get daily seed word', e)
    }
  }
  // free
  else {
    if (!newWord) {
      try {
        newWord = await Bogdle.__getNewSeedWord()
      } catch (err) {
        console.error('could not get new seed word', err)
      }
    }
  }

  // set gameMode's state seedWord
  Bogdle.__setState('seedWord', newWord, gameMode)
  Bogdle._saveGame(gameMode, 'createNewSolutionSet')

  // create Findle/Bogdle solutionSet
  try {
    const puzzle = await Bogdle.__createPuzzle(
      Bogdle.__getState(gameMode).seedWord,
      Bogdle.__getConfig(gameMode).dictionary,
      Bogdle.__getState(gameMode).difficulty
    )

    if (puzzle) {
      /**********************************************************************
       * set new Findle/Boggle solution                                      *
       * ------------------------------                                      *
       * load object of arrays (e.g. {"4":['aaaa'],"5":['aaaaa']})           *
       * turn into object of objects (e.g. {"4":{'aaaa':0},"5":{'aaaaa':0}}) *
       ***********************************************************************/

      // get a range of object keys from 4..Bogdle.__getMaxWordLength()
      const categories = Array.from({ length: Bogdle.__getMaxWordLength() - 2 }, (x, i) =>
        (i + 4).toString()
      )

      // zero them all out because setting it to the EMPTY_OBJ_SET_9 does not work :'(
      categories.forEach((category) => {
        Bogdle.__getConfig(gameMode).solutionSet[category] = {}
      })

      // create bogdle's solutionSet
      Object.keys(puzzle.solution).forEach((key) => {
        puzzle.solution[key].forEach((word) => {
          if (key <= Bogdle.__getMaxWordLength()) {
            if (!Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word]) {
              Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word] = {}
            }

            Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word] = 0
          }
        })
      })

      // set tile letter tracking
      Bogdle.__setConfig('letters', newWord.split(''), gameMode)

      // set score
      Bogdle.ui._setScore(0)

      // enable DOM buttons
      Bogdle.ui._enableUIButtons()

      // fill DOM tiles
      Bogdle.ui._resetTiles()
      Bogdle.ui._fillTiles()

      // choose letters randomly from solutionSet
      Bogdle.ui._shuffleTiles()

      Bogdle._logStatus(
        `[CREATED] '${gameMode}' '${
          Bogdle.__getState(gameMode).difficulty
        }' Puzzle from new solutionSet`,
        puzzle
      )
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// load existing solutionSet, which retains past progress
Bogdle._loadExistingSolutionSet = async function (gameMode, newWord = null, isNewDiff = false) {
  // set config to defaults
  Bogdle.__setConfig('letters', [], gameMode)
  Bogdle.__setConfig('tilesSelected', [], gameMode)

  // grab appropriate EMPTY_OBJ_SET_9
  // daily
  if (gameMode == 'daily') {
    Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_9, gameMode)
  }
  // free
  else {
    switch (Bogdle.__getMaxWordLength()) {
      case 5:
        Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_5, gameMode)
        break
      case 7:
        Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_7, gameMode)
        break
      case 9:
      default:
        Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_9, gameMode)
        break
    }
  }

  // initialize appropriate dictionary and seed words files
  Bogdle._initDictionaryFile(gameMode)
  Bogdle._initSeedWordsFile(gameMode)

  // new game with static seed word
  if (gameMode == 'daily') {
    // 'daily' always uses day hash
    try {
      const response = await fetch(BOGDLE_DAILY_SCRIPT)
      const data = await response.json()
      newWord = data['word']

      Bogdle.__updateDailyDetails(data['index'])

      if (!newWord) {
        console.error('daily word went bork', newWord)
      }
    } catch (e) {
      console.error('could not get daily seed word', e)
    }
  }
  // free
  else {
    if (!newWord) {
      try {
        newWord = await Bogdle.__getNewSeedWord()
      } catch (err) {
        console.error('could not get new seed word', err)
      }
    }
  }

  // set gameMode's state seedWord
  Bogdle.__setState('seedWord', newWord, gameMode)
  Bogdle._saveGame(gameMode, 'loadExistingSolutionSet')

  // load existing solutionSet
  try {
    const puzzle = await Bogdle.__createPuzzle(
      Bogdle.__getState(gameMode).seedWord,
      Bogdle.__getConfig(gameMode).dictionary,
      Bogdle.__getState(gameMode).difficulty
    )

    if (puzzle) {
      /**********************************************************************
       * set new Findle/Boggle solution                                      *
       * -------------------                                                 *
       * load object of arrays (e.g. {"4":['aaaa'],"5":['aaaaa']})           *
       * turn into object of objects (e.g. {"4":{'aaaa':0},"5":{'aaaaa':0}}) *
       ***********************************************************************/

      // get a range of object keys from 4..Bogdle.__getMaxWordLength()
      const categories = Array.from({ length: Bogdle.__getMaxWordLength() - 2 }, (x, i) =>
        (i + 4).toString()
      )
      const solutionSet = Bogdle.__getConfig(gameMode).solutionSet

      // zero them all out because setting it to the EMPTY_OBJ_SET_9 does not work :'(
      categories.forEach((category) => {
        Bogdle.__getConfig(gameMode).solutionSet[category] = {}
      })

      // re-create bogdle's solutionSet
      Object.keys(puzzle.solution).forEach((key) => {
        puzzle.solution[key].forEach((word) => {
          if (key <= Bogdle.__getMaxWordLength()) {
            if (!solutionSet[key.toString()][word]) {
              Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word] = {}
            }

            Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word] = 0
          }
        })
      })

      // set tile letter tracking
      Bogdle.__setConfig('letters', newWord.split(''), gameMode)

      // if just changing FREE difficulty, clear guessedWords
      if (isNewDiff) {
        Bogdle.__setState('guessedWords', [], 'free')
        Bogdle.ui._setScore(0)
        Bogdle._saveGame(gameMode)
      }
      // else check for pre-guessed words
      else {
        let lsState = null

        if (Bogdle.__getGameMode() == 'daily') {
          lsState = JSON.parse(localStorage.getItem(BOGDLE_STATE_DAILY_LS_KEY))
        } else {
          lsState = JSON.parse(localStorage.getItem(BOGDLE_STATE_FREE_LS_KEY))
        }

        Bogdle.__setState('guessedWords', [], gameMode)

        if (
          lsState[Bogdle.__getSessionIndex()].guessedWords &&
          lsState[Bogdle.__getSessionIndex()].guessedWords.length
        ) {
          lsState[Bogdle.__getSessionIndex()].guessedWords.forEach((word) => {
            Bogdle.__getState().guessedWords.push(word)
            Bogdle.__getConfig().solutionSet[word.length][word] = 1
          })

          // set score to existing number of guessedWords
          Bogdle.ui._setScore(Bogdle.__getState(gameMode).guessedWords.length)
        } else {
          Bogdle.ui._setScore(0)
        }
      }

      // enable DOM buttons
      Bogdle.ui._enableUIButtons()

      // fill DOM tiles
      Bogdle.ui._resetTiles()
      Bogdle.ui._fillTiles()

      // shuffle tiles randomly
      Bogdle.ui._shuffleTiles()

      // see if we've already won
      Bogdle._checkWinState()

      Bogdle._logStatus(
        `[LOADED] '${gameMode}' '${
          Bogdle.__getState(gameMode).difficulty
        }' Puzzle from existing solutionSet`,
        puzzle
      )
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// ask to create new free gamemode puzzle
Bogdle._confirmNewFree = async function () {
  const myConfirm = new Modal(
    'confirm',
    'Create New Free Play Puzzle?',
    'Are you <strong>sure</strong> you want to create a new free play puzzle?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    const confirmed = await myConfirm.question()

    if (confirmed) {
      Bogdle._resetFreeProgress()
      await Bogdle._createNewSolutionSet('free')
      Bogdle.ui._removeModalVestige()
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// reset config, state, and LS for free play
Bogdle._resetFreeProgress = async function () {
  // set config and state to defaults
  Bogdle.config.free = BOGDLE_DEFAULTS.config.free
  Bogdle.state.free = BOGDLE_DEFAULTS.state.free

  // set dictionary to default
  Bogdle._initDictionaryFile('free')

  // set score to 0
  Bogdle.ui._setScore(0)

  // re-enable DOM inputs
  Bogdle.ui._resetInput()

  // fill DOM tiles
  Bogdle.ui._fillTiles()

  // choose letters randomly from solutionSet
  Bogdle.ui._shuffleTiles()

  // save those defaults to localStorage
  Bogdle._saveGame('free')
}

// submit a word guess
Bogdle._submitWord = function (word) {
  if (Bogdle.__getState().gameState == 'IN_PROGRESS') {
    if (word.length >= Bogdle.minWordLength) {
      if (typeof Bogdle.__getConfig().solutionSet[word.length][word] != 'undefined') {
        if (Bogdle.__getConfig().solutionSet[word.length][word] !== 1) {
          if (word.length == Bogdle.__getMaxWordLength()) {
            Bogdle._audioPlay('pangram')
          } else {
            // choose correct[1-3] at random and play
            const num = Math.floor(Math.random() * 3) + 1
            Bogdle._audioPlay(`correct${num}`)
          }

          if (!Bogdle.__getState().guessedWords) {
            Bogdle.__setState('guessedWords', [])
          }

          Bogdle.__getState().guessedWords.push(word)
          Bogdle.__getState().guessedWords.sort()
          Bogdle.__setState('lastPlayedTime', new Date().getTime())

          Bogdle.__getConfig().solutionSet[word.length][word] = 1

          // clear hint if it's the same word
          if (word == Bogdle.__getConfig().hintWord) {
            Bogdle._clearHint()
          }

          Bogdle.dom.guess.classList.remove('animate__infinite')

          // do a little dance
          if (Bogdle.dom.guess.classList.contains('pangram')) {
            Bogdle.dom.guess.style.setProperty('--animate-duration', '1200ms')
            Bogdle.__setState('pangramFound', true)

            Bogdle._animateCSS('#guess', 'rubberBand').then(() => {
              Bogdle.dom.guess.classList.remove('first-guess', 'pangram')
              Bogdle.dom.guess.style.setProperty('--animate-duration', '150ms')

              Bogdle.modalOpen('win-pangram')

              if (Bogdle.settings.clearWord) {
                Bogdle.ui._resetTiles()
                Bogdle.ui._resetGuess()
              }
            })
          } else {
            Bogdle._animateCSS('#guess', 'pulse').then(() => {
              Bogdle.dom.guess.classList.remove('first-guess')

              if (Bogdle.settings.clearWord) {
                Bogdle.ui._resetTiles()
                Bogdle.ui._resetGuess()
              }
            })
          }

          // make a little love
          Bogdle.ui._increaseScore()

          // get down tonight
          Bogdle._saveGame(Bogdle.__getGameMode())

          // get down tonight
          Bogdle._checkWinState()
        } else {
          Bogdle.modalOpen('repeated-word', true, true)

          // choose repeat[1-3] at random and play
          const num = Math.floor(Math.random() * 3) + 1
          Bogdle._audioPlay(`repeat${num}`)

          Bogdle._animateCSS('#guess', 'headShake')
        }
      } else {
        Bogdle.modalOpen('invalid-word', true, true)

        // choose wrong[1-3] at random and play
        const num = Math.floor(Math.random() * 3) + 1
        Bogdle._audioPlay(`wrong${num}`)

        Bogdle._animateCSS('#guess', 'headShake')
      }
    } else {
      Bogdle.modalOpen('invalid-length', true, true)

      Bogdle._animateCSS('#guess', 'headShake')
    }
  } else {
    // game is over, so no more guessed allowed
    // console.error('current game is over no more guesses!')
  }
}

// game state checking
Bogdle._checkGuess = function () {
  // reset classes
  Bogdle.dom.guess.classList.remove('valid', 'first-guess', 'pangram', 'animate__infinite')
  Bogdle.dom.interactive.btnGuessLookup.disabled = true

  // guess valid length?
  if (Bogdle.dom.guess.innerHTML.length > 2) {
    let word = Bogdle.dom.guess.innerHTML.trim()
    let solutionSet = Bogdle.__getConfig().solutionSet

    // check all categories of words in solutionSet
    Object.keys(solutionSet).forEach((key) => {
      if (parseInt(key) <= Bogdle.__getMaxWordLength()) {
        // guess == valid word?
        if (Object.keys(solutionSet[key]).includes(word)) {
          Bogdle.dom.guess.classList.add('valid')
          Bogdle.dom.interactive.btnGuessLookup.disabled = false

          // and it's the first time?
          if (!solutionSet[key][word]) {
            Bogdle.dom.guess.classList.add('first-guess')

            // and it's the pangram word?!
            if (word.length == 9) {
              Bogdle.dom.guess.style.setProperty('--animate-duration', '600ms')
              Bogdle.dom.guess.classList.add('pangram')

              Bogdle._animateCSS('#guess', 'pulse', true)
            } else {
              Bogdle.dom.guess.style.setProperty('--animate-duration', '150ms')

              Bogdle._animateCSS('#guess', 'pulse')
            }
          }
        }
      }
    })
  }
}
Bogdle._checkWinState = function () {
  const solutionSet = Bogdle.__getConfig().solutionSet

  if (solutionSet) {
    const solutionSetValues = []

    Object.values(solutionSet).forEach((cat) => {
      Object.values(cat).forEach((val) => {
        solutionSetValues.push(val)
      })
    })

    if (solutionSetValues.every((val) => val)) {
      // set state stuff
      const gameState = Bogdle.__getState().gameState

      if (gameState == 'IN_PROGRESS') {
        // make sure to only increment wins if we are going from
        // IN_PROGRESS -> GAME_OVER (ignores page refreshes)
        Bogdle.__setState('gameState', 'GAME_OVER')

        const now = new Date().getTime()
        Bogdle.__setState('gameWon', true)
        Bogdle.__setState('lastCompletedTime', now)
        Bogdle.__setState('lastPlayedTime', now)

        Bogdle._saveGame(Bogdle.__getGameMode())
      }

      Bogdle.modalOpen('win-game')

      Bogdle.__winAnimation().then(() => {
        Bogdle.ui._resetTilesDuration()

        // disable inputs (until future re-enabling)
        Bogdle.ui._disableUITiles()

        // disable hint (until future re-enabling)
        Bogdle._disableHint()

        // disable main UI (until future re-enabling)
        Bogdle.ui._disableUIButtons()

        // display modal win thingy
        Bogdle.modalOpen('win')

        return true
      })
    } else {
      return false
    }
  } else {
    console.error('solutionSet not found')

    return false
  }
}

// modal: show how many words have been guessed
Bogdle._displayGameProgress = function () {
  let html = ''

  if (Bogdle.__getGameMode() == 'free') {
    html += `<h6>difficulty: ${Bogdle.__getState().difficulty}</h6>`
  }

  html += '<ul>'

  // check each length category (max...4, etc.)
  // total up words guessed in each
  Object.keys(Bogdle.__getConfig().solutionSet)
    .reverse()
    .forEach((category) => {
      if (parseInt(category) <= Bogdle.__getMaxWordLength()) {
        const categoryEntries = Object.entries(Bogdle.__getConfig().solutionSet[category])
        const categoryGuessed = categoryEntries.filter((entry) => entry[1])
        const categoryLength = Object.keys(Bogdle.__getConfig().solutionSet[category]).length

        let categoryClass = ''

        if (categoryLength == 0) {
          categoryClass = 'not-applicable'
        } else if (categoryGuessed.length == categoryLength) {
          categoryClass = 'full'
        }

        html += `<li class='${categoryClass}'><span class="solution-category">${category}-LETTER</span>`

        html += ` ${categoryGuessed.length} of ${categoryLength}`
        html += `<ul><li>`
        html += categoryGuessed
          .map((x) => x[0].toUpperCase())
          .sort()
          .join(', ')
        html += `</li></ul></li>`
      }
    })

  html += '</ul>'

  return html
}

// copy results to clipboard for sharing
Bogdle._shareResults = async function (shareType = 'completion') {
  let shareText = Bogdle.__getShareText(shareType)

  // if (navigator.canShare({ text: shareText })) {
  //   navigator.share({ text: shareText }).then(() => {
  //     console.log('sharing was successful')
  //   })
  //   .catch((error) => {
  //     if (error.name == 'AbortError') {
  //       console.log('user canceled share')
  //     } else {
  //       console.log('navigator.share failed', error)
  //     }
  //   })
  //   .finally(() => {
  //     // console.log('navigator.share() ended')
  //   })
  // } else {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        Bogdle.modalOpen('shared', shareType)
      })
      .catch(() => {
        console.error('could not copy text to clipboard')

        Bogdle.modalOpen('no-clipboard-access')

        return
      })
  } else {
    console.warn('no sharing or clipboard access available')

    Bogdle.modalOpen('no-clipboard-access')

    return
  }
  // }
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

Bogdle.__createPuzzle = async (seedWord, dictionary, difficulty) => {
  const puzzleInstance = new Puzzle(seedWord, dictionary, difficulty, (type = 'findle'))

  try {
    await puzzleInstance.createSolution()

    return puzzleInstance
  } catch (err) {
    console.error('Puzzle.createSolution() failed', err)
  }
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Bogdle.initApp()
