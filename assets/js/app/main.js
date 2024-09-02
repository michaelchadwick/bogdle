/* main */
/* app entry point and main functions */
/* global Bogdle */

Bogdle.minWordLength = 4

// settings: saved in LOCAL STORAGE
Bogdle.settings = {}

// config: only saved while game is loaded
Bogdle.config = BOGDLE_DEFAULTS.config

// state: saved between sessions in LOCAL STORAGE
Bogdle.state = BOGDLE_DEFAULTS.state

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
Bogdle.modalOpen = async function (type) {
  let modalText

  switch (type) {
    case 'start':
    case 'help':
      modalText = `
        <p>Find all the words in the jumble of letters! Select letters in any order and then hit <button class="help"><i class="fa-solid fa-check"></i></button>. Use <button class="help wide">HINT?</button> for help if you're stuck ('/' on keyboard to cycle).</p>

        <div class="flex">
          <div>
            <h4>Daily</h4>
            <p>Words are 4 to 8 letters, except for one 9-letter pangram. Come back every day (at 12 am PST) for a new one!</p>
          </div>

          <div>
            <h4>Free</h4>
            <p>Words are <em>at least</em> 4 letters, w/ max length equal to difficulty (EASY: 5, MEDIUM: 7, NORMAL: 9). Play endlessly!
          </div>
        </div>

        <ul class="help">
          <li><span class="invalid">WORD</span> - invalid word</li>
          <li><span class="valid">WORD</span> - valid, submitted word</li>
          <li><span class="valid first-guess">WORD</span> - valid, unsubmitted word</li>
        </ul>

        <ul class="help">
          <li><button class="help"><i class="fa-solid fa-check"></i></button> Submit word (Enter/Return)</li>
          <li><button class="help"><i class="fa-solid fa-backspace"></i></button> Delete last letter in guess (Back/Del)</li>
          <li><button class="help"><i class="fa-solid fa-xmark"></i></button> Clear entire guess</li>
          <li><button class="help"><i class="fa-solid fa-shuffle"></i></button> Shuffle the tiles (Space)</li>
          <li><button class="help"><i class="fa-solid fa-list-check"></i></button> Show current progress</li>
          <li><button class="help"><i class="fa-solid fa-book"></i></button> Lookup valid word in dictionary</li>
          <li><button class="help"><i class="fa-solid fa-circle-plus"></i></button> Create new puzzle (Free mode)</li>
        </ul>

        <hr />

        <p><strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>. <strong>Sound</strong>: Fliss.</p>
      `

      Bogdle.myModal = new Modal(
        'perm',
        'How to Play Bogdle',
        modalText,
        null,
        null
      )
      break

    case 'dictionary':
      const word = Bogdle.dom.guess.innerHTML

      Bogdle.myModal = new Modal(
        'perm',
        'Dictionary (via Free Dictionary API)',
        'loading definition...',
        null,
        null,
        false
      )

      const modalDialogText = document.querySelector(
        '.modal-dialog .modal-text'
      )

      try {
        const response = await fetch(`${BOGDLE_DEFINE_LOOKUP_URL}/${word}`)
        const responseJson = await response.json()

        // found word
        if (responseJson[0]) {
          const entry = responseJson[0]

          modalText = `
            <div class="dictionary">
              <strong>${entry.word}</strong> ${entry.phonetic}
              <hr />
              <em>${entry.meanings[0].partOfSpeech}</em>: ${entry.meanings[0].definitions[0].definition}
            </div>
          `
        } else {
          modalText = `
            <div class="dictionary">
              <strong>${word}</strong> not found!
            </div>
          `
        }

        modalDialogText.innerHTML = modalText
      } catch (e) {
        modalDialogText.innerHTML =
          'Error: Free Dictionary could not be contacted.'

        console.error('could not lookup word', e)
      }
      break

    case 'stats':
    case 'win':
      modalText = `
        <div class="container">

          <div class="statistic-header">Daily</div>
          <div class="statistic-subheader">
            (<small>New puzzle available at 12am PST</small>)
          </div>

          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getGameCount('daily')}</div>
              <div class="statistic-label">Game(s) Finished</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getWordCount('daily')}</div>
              <div class="statistic-label">Word(s) Found</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getHintCount('daily')}</div>
              <div class="statistic-label">Hints(s) Used</div>
            </div>
          </div>
        `

      if (Bogdle.__getState('daily').pangramFound) {
        modalText += `
            <div class="statistic-additional">
              <div class="flex">
                <span>Today's Pangram Found!</span>
                <span>
                  <button class="share tiny" onclick="Bogdle._shareResults('pangram')">Share <i class="fa-solid fa-share-nodes"></i></button>
                </span>
              </div>
            </div>

            <p>&nbsp</p>
          `
      }

      modalText += `
          <div class="statistic-header">Free Play</div>
          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getGameCount('free')}</div>
              <div class="statistic-label">Game(s) Finished</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getWordCount('free')}</div>
              <div class="statistic-label">Word(s) Found</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getHintCount('free')}</div>
              <div class="statistic-label">Hint(s) Used</div>
            </div>
          </div>
      `

      if (Bogdle.__getState().gameState == 'GAME_OVER') {
        modalText += `
          <div class="share">
            <button class="share" onclick="Bogdle._shareResults()">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>
        `
      }

      modalText += `
        </div>
      `

      Bogdle.myModal = new Modal(
        'perm',
        'Statistics',
        modalText,
        null,
        null,
        false
      )
      break

    case 'settings':
      modalText = `
        <div id="settings">
          <!-- clear word -->
          <div class="setting-row">
            <div class="text">
              <div class="title">Clear Word</div>
              <div class="description">Clear word on valid submission</div>
            </div>
            <div class="control">
              <div class="container">
                <div id="button-setting-clear-word"
                  data-status=""
                  class="switch"
                  onclick="Bogdle._changeSetting('clearWord')"
                >
                  <span class="knob"></span>
                </div>
              </div>
            </div>
          </div>
          <!-- dark mode -->
          <div class="setting-row">
            <div class="text">
              <div class="title">Dark Mode</div>
              <div class="description">Change colors to better suit low light</div>
            </div>
            <div class="control">
              <div class="container">
                <div id="button-setting-dark-mode"
                  data-status=""
                  class="switch"
                  onclick="Bogdle._changeSetting('darkMode')"
                >
                  <span class="knob"></span>
                </div>
              </div>
            </div>
          </div>
          <!-- noisy -->
          <div class="setting-row">
            <div class="text">
              <div class="title">Sounds</div>
              <div class="description">Enable some cute sound effects</div>
            </div>
            <div class="control">
              <div class="container">
                <div id="button-setting-noisy"
                  data-status=""
                  class="switch"
                  onclick="Bogdle._changeSetting('noisy')"
                >
                  <span class="knob"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

      Bogdle.myModal = new Modal('perm', 'Settings', modalText, null, null)

      Bogdle._loadSettings()

      break

    case 'show-progress':
      Bogdle.myModal = new Modal(
        'perm',
        'Game Progress',
        Bogdle._displayGameProgress(),
        null,
        null
      )
      break

    case 'show-solution':
      Bogdle.myModal = new Modal(
        'perm-debug',
        'Master Word List',
        Bogdle._displayGameSolution(),
        null,
        null
      )
      break
    case 'show-config':
      Bogdle.myModal = new Modal(
        'perm-debug',
        'Game Config (code model only)',
        Bogdle._displayGameConfig(),
        null,
        null
      )
      break
    case 'show-state':
      Bogdle.myModal = new Modal(
        'perm-debug',
        'Game State (load from/save to LS)',
        Bogdle._displayGameState(),
        null,
        null
      )
      break

    case 'loading':
      Bogdle.myModal = new Modal(
        'throbber',
        'Loading',
        'loading...',
        null,
        null,
        false
      )
      break

    case 'invalid-length':
      Bogdle.myModal = new Modal(
        'temp',
        null,
        'Needs to be 4 or more characters',
        null,
        null
      )
      break
    case 'invalid-word':
      Bogdle.myModal = new Modal('temp', null, 'Not in word list', null, null)
      break
    case 'repeated-word':
      Bogdle.myModal = new Modal('temp', null, 'Word already found', null, null)
      break
    case 'shared':
      Bogdle.myModal = new Modal(
        'temp',
        null,
        'Results copied to clipboard',
        null,
        null
      )
      break
    case 'no-clipboard-access':
      Bogdle.myModal = new Modal(
        'temp',
        null,
        'Sorry, but access to clipboard not available',
        null,
        null
      )
      break

    case 'win-pangram':
      modalText = `
        <div class="container">

          <div class="flex">
            <p><strong>You found the 9-letter pangram</strong>!</p>
          </div>

          <div class="flex">
            <p>You <em>could</em> stop now, share your accomplishment, and go on about your day.</p>
          </div>

          <div class="share">
            <button class="share" onclick="Bogdle._shareResults('pangram')">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>

          <p>&nbsp</p>

          <div class="flex">
            <p>Or...you could find the rest of the words!</p>
          </div>
        </div>
      `

      Bogdle.myModal = new Modal(
        'perm',
        'Pangram Found!',
        modalText,
        null,
        null,
        false
      )
      break

    case 'win-game':
      Bogdle.myModal = new Modal('temp', null, 'Congratulations!', null, null)
      break

    case 'win-game-hax':
      Bogdle.myModal = new Modal(
        'temp',
        null,
        'Hacking the game, I see',
        null,
        null
      )
      break
  }
}

// start the engine
Bogdle.initApp = async () => {
  // if local dev, show debug stuff
  if (Bogdle.env == 'local') {
    Bogdle._initDebug()

    if (!document.title.includes('(LH) ')) {
      document.title = '(LH) ' + document.title
    }
  }

  Bogdle._attachEventListeners()

  Bogdle._getNebyooApps()

  Bogdle._loadGame()

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
      BOGDLE_WORD_SOURCES[
        BOGDLE_DIFFICULTY[Bogdle.__getState('free').difficulty]
      ]
  } else {
    // 'daily' is always 'normal' difficulty
    Bogdle.__getConfig(gameMode).seedWordsFile +=
      BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY['normal']]
  }

  Bogdle.__getConfig(gameMode).seedWordsFile += `/words_9-9.json`
}

// initialize dictionary to find words for solutionSet
Bogdle._initDictionaryFile = function (gameMode) {
  let dictFilePath = BOGDLE_DICT_FILE_ROOT

  if (gameMode == 'free') {
    dictFilePath +=
      BOGDLE_WORD_SOURCES[
        BOGDLE_DIFFICULTY[Bogdle.__getState(gameMode).difficulty]
      ]
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

  if (gameMode == 'free') {
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
  } else {
    Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_9, gameMode)
  }

  // set state to defaults
  Bogdle.__setState('difficulty', 'normal', gameMode)
  Bogdle.__setState('gameState', 'IN_PROGRESS', gameMode)
  Bogdle.__setState('gameWon', false, gameMode)
  Bogdle.__setState('guessedWords', [], gameMode)
  Bogdle.__setState('lastCompletedTime', null, gameMode)
  Bogdle.__setState('lastPlayedTime', null, gameMode)
  Bogdle.__setState('pangramFound', false, gameMode)

  // initialize appropriate dictionary and seed words files
  Bogdle._initDictionaryFile(gameMode)
  Bogdle._initSeedWordsFile(gameMode)

  // get seed word
  if (gameMode == 'free') {
    if (!newWord) {
      try {
        newWord = await Bogdle.__getNewSeedWord()
      } catch (err) {
        console.error('could not get new seed word', err)
      }
    }
  } else {
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

  // set gameMode's state seedWord
  Bogdle.__setState('seedWord', newWord, gameMode)
  Bogdle._saveGame()

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
      const categories = Array.from(
        { length: Bogdle.__getMaxWordLength() - 2 },
        (x, i) => (i + 4).toString()
      )

      // zero them all out because setting it to the EMPTY_OBJ_SET_9 does not work :'(
      categories.forEach((category) => {
        Bogdle.__getConfig(gameMode).solutionSet[category] = {}
      })

      // create bogdle's solutionSet
      Object.keys(puzzle).forEach((key) => {
        puzzle[key].forEach((word) => {
          if (key <= Bogdle.__getMaxWordLength()) {
            if (
              !Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word]
            ) {
              Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word] =
                {}
            }

            Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word] = 0
          }
        })
      })

      // set tile letter tracking
      Bogdle.__setConfig('letters', newWord.split(''), gameMode)

      // set score
      Bogdle._setScore(0)

      // fill DOM tiles
      Bogdle._fillTiles()

      // choose letters randomly from solutionSet
      Bogdle._shuffleTiles()
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// load existing solutionSet, which retains past progress
Bogdle._loadExistingSolutionSet = async function (
  gameMode,
  newWord = null,
  isNewDiff = false
) {
  // set config to defaults
  Bogdle.__setConfig('letters', [], gameMode)
  Bogdle.__setConfig('tilesSelected', [], gameMode)

  // grab appropriate EMPTY_OBJ_SET_9
  if (gameMode == 'free') {
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
  } else {
    Bogdle.__setConfig('solutionSet', EMPTY_OBJ_SET_9, gameMode)
  }

  // initialize appropriate dictionary and seed words files
  Bogdle._initDictionaryFile(gameMode)
  Bogdle._initSeedWordsFile(gameMode)

  // new game with static seed word
  if (gameMode == 'free') {
    if (!newWord) {
      try {
        newWord = await Bogdle.__getNewSeedWord()
      } catch (err) {
        console.error('could not get new seed word', err)
      }
    }
  } else {
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

  // set gameMode's state seedWord
  Bogdle.__setState('seedWord', newWord, gameMode)
  Bogdle._saveGame()

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
      const categories = Array.from(
        { length: Bogdle.__getMaxWordLength() - 2 },
        (x, i) => (i + 4).toString()
      )
      const solutionSet = Bogdle.__getConfig(gameMode).solutionSet

      // zero them all out because setting it to the EMPTY_OBJ_SET_9 does not work :'(
      categories.forEach((category) => {
        Bogdle.__getConfig(gameMode).solutionSet[category] = {}
      })

      // re-create bogdle's solutionSet
      Object.keys(puzzle).forEach((key) => {
        puzzle[key].forEach((word) => {
          if (key <= Bogdle.__getMaxWordLength()) {
            if (!solutionSet[key.toString()][word]) {
              Bogdle.__getConfig(gameMode).solutionSet[key.toString()][word] =
                {}
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
        Bogdle._setScore(0)
        Bogdle._saveGame()
      } // else check for pre-guessed words
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
          Bogdle._setScore(Bogdle.__getState(gameMode).guessedWords.length)
        } else {
          Bogdle._setScore(0)
        }
      }

      // fill DOM tiles
      Bogdle._fillTiles()

      // shuffle tiles randomly
      Bogdle._shuffleTiles()

      // see if we've already won
      Bogdle._checkWinState()
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// ask to create new free gamemode puzzle
Bogdle._confirmFreeCreateNew = async function () {
  const myConfirm = new Modal(
    'confirm',
    'Create New Puzzle?',
    'Are you <strong>sure</strong> you want to create a new puzzle?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    const confirmed = await myConfirm.question()

    if (confirmed) {
      Bogdle._resetFreeProgress()
      await Bogdle._createNewSolutionSet('free')
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
  Bogdle._setScore(0)

  // re-enable DOM inputs
  Bogdle._resetInput()

  // fill DOM tiles
  Bogdle._fillTiles()

  // choose letters randomly from solutionSet
  Bogdle._shuffleTiles()

  // save those defaults to localStorage
  Bogdle._saveGame()
}

// submit a word guess
Bogdle._submitWord = function (word) {
  if (Bogdle.__getState().gameState == 'IN_PROGRESS') {
    if (word.length >= Bogdle.minWordLength) {
      if (
        typeof Bogdle.__getConfig().solutionSet[word.length][word] !=
        'undefined'
      ) {
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

          console.log('adding words to guessedWords')

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
                Bogdle._resetTiles()
                Bogdle._resetGuess()
              }
            })
          } else {
            Bogdle._animateCSS('#guess', 'pulse').then(() => {
              Bogdle.dom.guess.classList.remove('first-guess')

              if (Bogdle.settings.clearWord) {
                Bogdle._resetTiles()
                Bogdle._resetGuess()
              }
            })
          }

          // make a little love
          Bogdle._increaseScore()

          // get down tonight
          Bogdle._saveGame()

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

Bogdle._increaseScore = function () {
  // get current score as an integer
  const curGuessed = parseInt(Bogdle.dom.scoreGuessed.innerHTML)
  // increase and convert back to string
  Bogdle.dom.scoreGuessed.innerHTML = (curGuessed + 1).toString()
}
Bogdle._setScore = function (guessed = 0) {
  // set UI elements
  Bogdle.dom.scoreGuessed.innerHTML = guessed.toString()
  Bogdle.dom.scoreGuessedOf.innerHTML = ' of '
  Bogdle.dom.scoreTotal.innerHTML = Bogdle.__getSolutionSize().toString()
  Bogdle.dom.scoreTotalWords.innerHTML = ' words'
}

// game state checking
Bogdle._checkGuess = function () {
  // reset classes
  Bogdle.dom.guess.classList.remove(
    'valid',
    'first-guess',
    'pangram',
    'animate__infinite'
  )
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

        Bogdle._saveGame()
      }

      Bogdle.modalOpen('win-game')

      Bogdle.__winAnimation().then(() => {
        Bogdle.__resetTilesDuration()

        // disable inputs (until future re-enabling)
        Bogdle._disableUITiles()

        // disable hint (until future re-enabling)
        Bogdle._disableHint()

        // disable main UI (until future re-enabling)
        Bogdle._disableUIButtons()

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

// reset UI tiles to default state
Bogdle._resetInput = function () {
  Bogdle._resetTiles()

  Bogdle._enableHint()

  Bogdle._resetGuess()
}
// set all tiles back to 'tbd'
Bogdle._resetTiles = function () {
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile) => {
    tile.dataset.state = 'tbd'
  })
}
// blank out the current DOM guess div
Bogdle._resetGuess = function () {
  Bogdle.dom.guess.innerHTML = ''
  Bogdle.dom.guess.classList.remove('valid')
  Bogdle.dom.interactive.btnGuessLookup.disabled = true
}

Bogdle._disableUITiles = function () {
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile) => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}
Bogdle._disableUIButtons = function () {
  Object.values(Bogdle.dom.mainUI).forEach((btn) => {
    if (!btn.dataset.permanent) {
      btn.setAttribute('disabled', '')
    }
  })
}
Bogdle._enableUIButtons = function () {
  Object.values(Bogdle.dom.mainUI).forEach((btn) => {
    if (btn.id !== 'button-show-progress') {
      btn.removeAttribute('disabled')
    }
  })
}

Bogdle._fillTiles = function () {
  const letters = Bogdle.__getConfig().letters

  // fill UI tiles with letters
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile, i) => {
    tile.innerHTML = letters[i]
  })
}

// randomize the order of tiles
Bogdle._shuffleTiles = function () {
  let letters = Bogdle.__getConfig().letters

  // shuffle order of letters
  let j, x, index
  for (index = letters.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1))
    x = letters[index]
    letters[index] = letters[j]
    letters[j] = x
  }

  Bogdle._fillTiles()

  // make sure game is playable again
  Bogdle._resetInput()
}

// remove last letter in DOM guess div
Bogdle._removeLastLetter = function () {
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
Bogdle._resizeBoard = function () {
  const boardContainer = document.querySelector('#board-container')
  const boardHeight = boardContainer.clientHeight + 20
  const containerHeight = Math.min(Math.floor(boardHeight), 350)
  const tileHeight = 2.5 * Math.floor(containerHeight / 3)

  const board = document.querySelector('#board')
  board.style.width = `${containerHeight}px`
  board.style.height = `${tileHeight}px`
}

// modal: show how many words have been guessed
Bogdle._displayGameProgress = function () {
  let html = ''

  if (Bogdle.__getGameMode() == 'free') {
    html += `<h6>difficulty: ${Bogdle._getState().difficulty}</h6>`
  }

  html += '<ul>'

  // check each length category (max...4, etc.)
  // total up words guessed in each
  Object.keys(Bogdle.__getConfig().solutionSet)
    .reverse()
    .forEach((category) => {
      if (parseInt(category) <= Bogdle.__getMaxWordLength()) {
        const categoryEntries = Object.entries(
          Bogdle.__getConfig().solutionSet[category]
        )
        const categoryGuessed = categoryEntries.filter((entry) => entry[1])
        const categoryLength = Object.keys(
          Bogdle.__getConfig().solutionSet[category]
        ).length

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
Bogdle._shareResults = async function (type = 'completion') {
  let shareText = ''
  const size = Bogdle.__getSolutionSize()
  const hints = Bogdle.__getHintsUsed()

  if (type == 'completion') {
    shareText += `🧩 Bogdle #${Bogdle.dailyNumber}\n${size}/${size} words, ${hints} hints\n`
    shareText += BOGDLE_SHARE_URL
  } else if (type == 'pangram') {
    shareText += `🧩 Bogdle #${Bogdle.dailyNumber}\nPangram found!\n`
    shareText += BOGDLE_SHARE_URL
  }

  if (navigator.canShare) {
    navigator.share({ text: shareText })
  } else {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          Bogdle.modalOpen('shared')
        })
        .catch(() => {
          console.error('could not copy text to clipboard')

          Bogdle.modalOpen('no-clipboard-access')

          return
        })

      // const canWrite = await navigator.permissions.query({ name: 'clipboard-write' })

      // if (canWrite.state == 'granted') {
      //   navigator.clipboard.writeText(shareText).then(() => {
      //     Bogdle.modalOpen('shared')
      //   }).catch(() => console.error('could not copy text to clipboard'))
      // } else {
      //   console.warn('clipboard access was denied')

      //   Bogdle.modalOpen('no-clipboard-access')
      // }
    } else {
      console.warn('no sharing or clipboard access available')

      Bogdle.modalOpen('no-clipboard-access')

      return
    }
  }
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

Bogdle.__createPuzzle = async (seedWord, dictionary, difficulty) => {
  console.log(
    `new '${Bogdle.__getGameMode()}' Puzzle('${seedWord}', '${dictionary}', '${difficulty}')`
  )
  const puzzleInstance = new Puzzle(
    seedWord,
    dictionary,
    difficulty,
    (type = 'findle')
  )

  try {
    await puzzleInstance.createSolution()

    return puzzleInstance.solution
  } catch (err) {
    console.error('Puzzle.createSolution() failed', err)
  }
}

Bogdle.__winAnimation = async function () {
  return new Promise((resolve, reject) => {
    Array.from(Bogdle.dom.interactive.tiles).forEach((tile) =>
      tile.style.setProperty('--animate-duration', '1000ms')
    )

    setTimeout(() => Bogdle._animateCSS('#tile1', 'bounce'), 0)
    setTimeout(() => Bogdle._animateCSS('#tile2', 'bounce'), 100)
    setTimeout(() => Bogdle._animateCSS('#tile3', 'bounce'), 200)
    setTimeout(() => Bogdle._animateCSS('#tile4', 'bounce'), 300)
    setTimeout(() => Bogdle._animateCSS('#tile5', 'bounce'), 400)
    setTimeout(() => Bogdle._animateCSS('#tile6', 'bounce'), 500)
    setTimeout(() => Bogdle._animateCSS('#tile7', 'bounce'), 600)
    setTimeout(() => Bogdle._animateCSS('#tile8', 'bounce'), 700)
    setTimeout(() => Bogdle._animateCSS('#tile9', 'bounce'), 800)

    setTimeout(() => resolve('__winAnimation ended'), 2000)
  })
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Bogdle.initApp()
