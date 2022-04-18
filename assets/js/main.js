this.bogdle = this.bogdle || {}

this.bogdle.config = {}
this.bogdle.config.difficulty = 'normal'
this.bogdle.env = 'local'
// this.bogdle.startWord = 'education'
this.bogdle.startWord = 'scenarios'

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
function modalOpen(type) {
  switch(type) {
    case 'start':
    case 'help':
      this.myModal = new Modal('perm', 'How to Play Bogdle',
        `
          <p>Find all the words in the jumble of letters! Each word is between 3 and 9 letters long. After each word is found, the counter of words out of the total words will increase. Find all valid words and win!</p>

          <hr />

          <p>A new BOGDLE will be available each day!</p>
        `,
        null,
        null
      )
      break

    case 'stats':
    case 'win':
      this.myModal = new Modal('perm', 'Statistics',
        `
          <div class="container">
            <div id="statistics">
              <div class="statistic-container">
                <div class="statistic">${this.bogdle.statistics.gamesPlayed}</div>
                <div class="statistic-label">Played</div>
              </div>
              <div class="statistic-container">
                <div class="statistic">${this.bogdle.statistics.wordsFound}</div>
                <div class="statistic-label">Words Found</div>
              </div>
            </div>
          </div>
        `,
        null,
        null,
        false
      )
      break

    case 'settings':
      this.myModal = new Modal('perm', 'Settings',
        `
          <div id="settings">
            <div class="setting-row">
              <div class="text">
                <div class="title">Dark Mode</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-dark-mode" data-status="" class="switch" onclick="_changeSetting('dark-mode')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="setting-row">
              <div class="text">
                <div class="title">Difficulty</div>
                <div class="description">The max length of a word</div>
              </div>
              <div class="control">
                <div class="container" id="container-difficulty">
                  <div class="radio">
                    <input id="diff-0" name="diff-radio" type="radio" data-diffid="kid" onclick="_changeSetting('difficulty')">
                    <label for="diff-0" class="radio-label">Kid (3)</label>
                  </div>

                  <div class="radio">
                    <input id="diff-1" name="diff-radio" type="radio" data-diffid="easy" onclick="_changeSetting('difficulty')">
                    <label for="diff-1" class="radio-label">Easy (5)</label>
                  </div>

                  <div class="radio">
                    <input id="diff-2" name="diff-radio" type="radio" data-diffid="medium" onclick="_changeSetting('difficulty')">
                    <label for="diff-2" class="radio-label">Med (7)</label>
                  </div>

                  <div class="radio">
                    <input id="diff-3" name="diff-radio" type="radio" data-diffid="normal" onclick="_changeSetting('difficulty')">
                    <label for="diff-3" class="radio-label">Normal (9)</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        null,
        null
      )


      _loadSettings()

      break

    case 'show-progress':
      this.myModal = new Modal('perm', 'Game Progress',
        _displayGameProgress(),
        null,
        null
      )
      break
    case 'show-list':
      this.myModal = new Modal('perm-debug', 'Master Word List',
        _displayGameSolution(),
        null,
        null
      )
      break
    case 'show-config':
      this.myModal = new Modal('perm-debug', 'Bogdle Config',
        _displayGameConfig(),
        null,
        null
      )
      break

    case 'loading':
      this.myModal = new Modal('throbber', 'Loading',
        'loading...',
        null,
        null,
        false
      )
      break

    case 'invalid-length':
      this.myModal = new Modal('temp', null,
        'Needs to be 3 or more characters',
        null,
        null
      )
      break
    case 'invalid-word':
      this.myModal = new Modal('temp', null,
        'Not in word list',
        null,
        null
      )
      break
    case 'repeated-word':
      this.myModal = new Modal('temp', null,
        'Word already found',
        null,
        null
      )
      break
  }
}

// submit a guess
function submitWord(word) {
  console.log('submitting word...', word)

  if (this.bogdle.config.gameState == 'IN_PROGRESS') {
    if (word.length > 2) {
      if (typeof this.bogdle.solutionSet[word.length][word] != 'undefined') {
        if (this.bogdle.solutionSet[word.length][word] !== 1) {

          if (!this.bogdle.config.guessedWords) {
            this.bogdle.config.guessedWords = []
          }

          this.bogdle.config.guessedWords.push(word)
          this.bogdle.config.guessedWords.sort()
          this.bogdle.config.lastPlayedTime = new Date().getTime()

          this.bogdle.solutionSet[word.length][word] = 1
          this.bogdle.statistics.wordsFound += 1

          animateCSS('#guess', 'tada')

          _saveGameState()

          _increaseScore()

          this.bogdle.dom.status.guess.classList.remove('first-guess')

          _checkWinState()
        } else {
          modalOpen('repeated-word', true, true)
          animateCSS('#guess', 'headShake')
        }
      } else {
        modalOpen('invalid-word', true, true)
        animateCSS('#guess', 'headShake')
      }
    } else {
      modalOpen('invalid-length', true, true)
      animateCSS('#guess', 'headShake')
    }
  } else {
    // game is over, so no more guessed allowed
    // console.error('current game is over; no more guesses!')
  }
}

// start the engine
this.bogdle.init = async () => {
  // console.log('init started')

  // set env
  this.bogdle.env = document.location.hostname == ENV_PROD_URL ? 'prod' : 'local'

  // if local dev, show debug stuff
  if (this.bogdle.env == 'local') {
    // if debug buttons are in template
    if (this.bogdle.dom.interactive.debug.all) {
      // show debug buttons
      this.bogdle.dom.interactive.debug.all.style.display = 'flex'
      // make header buttons smaller to fit in debug buttons
      document.querySelectorAll('button.icon').forEach((btn) => {
        btn.style.fontSize = '16px'
      })
    }
  }

  // attach event listeners to DOM elements
  _addEventListeners()

  // load localStorage game state
  _loadGameState()

  // console.log('!bogdle has been initialized!')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// load state/statistics from LS -> code model
async function _loadGameState() {
  var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_KEY))

  // load game state
  if (lsConfig) {
    console.log('localStorage key found and loading...', lsConfig)

    // set game difficulty
    this.bogdle.config.difficulty = lsConfig.difficulty

    // set game state
    this.bogdle.config.gameState = lsConfig.gameState

    // set pre-guessed words
    this.bogdle.config.guessedWords = lsConfig.guessedWords

    // set last completed
    this.bogdle.config.lastCompletedTime = lsConfig.lastCompletedTime
    // set last played
    this.bogdle.config.lastPlayedTime = lsConfig.lastPlayedTime

    await _loadExistingSolutionSet(this.bogdle.startWord)

    // no lastPlayedTime?
    if (this.bogdle.config.lastPlayedTime == null) {
      modalOpen('help')
    }

    console.log('!localStorage key loaded!', this.bogdle.config)
  } else {
    console.log('no localStorage key found; defaults being set')

    if (this.bogdle.env == 'prod') {
      await _createNewSolutionSet()
    } else {
      await _createNewSolutionSet(this.bogdle.startWord)
    }

    modalOpen('start')
  }

  // load game settings
  _loadSettings()

  // load user statistics
  if (localStorage.getItem(LS_STATS_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_STATS_KEY))

    this.bogdle.statistics = {
      "gamesPlayed": lsConfig.gamesPlayed,
      "wordsFound": lsConfig.wordsFound
    }
  } else {
    this.bogdle.statistics = {
      "gamesPlayed": 0,
      "wordsFound": 0
    }
  }

  _saveGameState()

  // console.log('!progress loaded!', this.bogdle.solutionSet)
}

// create new solution set, which resets progress
async function _createNewSolutionSet(newWord = null, isNewDiff = false) {
  // default config and stats (both save to, and are loaded from, localStorage)
  this.bogdle.config.gameState = 'IN_PROGRESS'
  this.bogdle.config.guessedWords = []
  this.bogdle.config.lastCompletedTime = null
  this.bogdle.config.lastPlayedTime = null

  this.bogdle.statistics = {
    "gamesPlayed": 0,
    "wordsFound": 0
  }

  // dictionary to pull from
  this.bogdle.dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[this.bogdle.config.difficulty]]}/words_3-${_getMaxWordLength()}.json`

  console.log('this.bogdle.dictionary', this.bogdle.dictionary)

  this.bogdle.letters = []

  this.bogdle.solutionSet = EMPTY_OBJ_SET

  this.bogdle.startWordsFile = './assets/json/'
  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  this.bogdle.startWordsFile += WORD_SOURCES[DIFFICULTY[this.bogdle.config.difficulty]]
  this.bogdle.startWordsFile += `/words_9-9.json`

  console.log('this.bogdle.startWordsFiles', this.bogdle.startWordsFile)

  // keep track of which tiles have been selected
  this.bogdle.tilesSelected = []

  // new game with static start word
  if (newWord) {
    console.log(`new solution requested with static word '${newWord}'...`)
  } // new game with random start word
  else {
    try {
      newWord = await __getNewStartWord()

      console.log(`new solution requested with random word '${newWord}'...`)
    } catch (err) {
      console.error('could not get new start word', err)
    }
  }

  this.bogdle.startWord = newWord

  // create new game
  try {
    const findle = await createFindle(
      this.bogdle.startWord,
      this.bogdle.dictionary,
      this.bogdle.config
    )

    if (findle) {
      /********************************************************************
      * set new Bogdle/Findle solution                                    *
      * -------------------                                               *
      * load object of arrays (e.g. {"3":['aaa'],"4":['aaaa']})           *
      * turn into object of objects (e.g. {"3":{'aaa':0},"4":{'aaaa':0}}) *
      *********************************************************************/

      // get a range of object keys from 3.._getMaxWordLength()
      var categories = Array.from({length: _getMaxWordLength() - 2}, (x, i) => (i + 3).toString());

      // zero them all out because setting it to the EMPTY_OBJ_SET does not work :'(
      categories.forEach(category => {
        this.bogdle.solutionSet[category] = {}
      })

      // create bogdle's solution set
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (!this.bogdle.solutionSet[key.toString()][word]) {
            this.bogdle.solutionSet[key.toString()][word] = {}
          }

          this.bogdle.solutionSet[key.toString()][word] = 0
        })
      })

      // console.log('test: this.bogdle.solutionSet', this.bogdle.solutionSet)

      // set tile letter tracking
      this.bogdle.letters = newWord.split('')

      // set score
      _setScore(0)

      // choose letters randomly from solution set
      _shuffleTiles()
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// load existing solution set, which retains past progress
async function _loadExistingSolutionSet(newWord = null, isNewDiff = false) {
  // dictionary to pull from
  this.bogdle.dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[this.bogdle.config.difficulty]]}/words_3-${_getMaxWordLength()}.json`

  this.bogdle.letters = []

  this.bogdle.solutionSet = EMPTY_OBJ_SET

  this.bogdle.startWordsFile = './assets/json/'
  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  this.bogdle.startWordsFile += WORD_SOURCES[DIFFICULTY[this.bogdle.config.difficulty]]
  this.bogdle.startWordsFile += `/words_9-9.json`

  // console.log('this.bogdle.startWordsFiles', this.bogdle.startWordsFile)

  // keep track of which tiles have been selected
  this.bogdle.tilesSelected = []

  // new game with static start word
  if (newWord) {
    console.log(`existing solution requested with static word '${newWord}'...`)
  } // new game with random start word
  else {
    try {
      newWord = await __getNewStartWord()

      console.log(`existing solution requested with random word '${newWord}'...`)
    } catch (err) {
      console.error('could not get new start word', err)
    }
  }

  this.bogdle.startWord = newWord

  // load existing game
  try {
    const findle = await createFindle(
      this.bogdle.startWord,
      this.bogdle.dictionary,
      this.bogdle.config
    )

    if (findle) {
      /********************************************************************
      * set new Bogdle/Findle solution                                    *
      * -------------------                                               *
      * load object of arrays (e.g. {"3":['aaa'],"4":['aaaa']})           *
      * turn into object of objects (e.g. {"3":{'aaa':0},"4":{'aaaa':0}}) *
      *********************************************************************/

      // get a range of object keys from 3.._getMaxWordLength()
      var categories = Array.from({length: _getMaxWordLength() - 2}, (x, i) => (i + 3).toString());

      // zero them all out because setting it to the EMPTY_OBJ_SET does not work :'(
      categories.forEach(category => {
        this.bogdle.solutionSet[category] = {}
      })

      // re-create bogdle's solution set
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (!this.bogdle.solutionSet[key.toString()][word]) {
            this.bogdle.solutionSet[key.toString()][word] = {}
          }

          this.bogdle.solutionSet[key.toString()][word] = 0
        })
      })

      // set tile letter tracking
      this.bogdle.letters = newWord.split('')

      // if just changing difficulty, clear guessedWords
      if (isNewDiff) {
        this.bogdle.config.guessedWords = []
        _setScore(0)
        _saveGameState()
      } // else check for pre-guessed words
      else {
        var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_KEY))

        this.bogdle.config.guessedWords = []

        console.log('checking off pre-guessed words...', lsConfig)

        if (lsConfig.guessedWords && lsConfig.guessedWords.length) {
          console.log('found some pre-guessed words, so adding to code')

          lsConfig.guessedWords.forEach(word => {
            this.bogdle.config.guessedWords.push(word)
            this.bogdle.solutionSet[word.length][word] = 1
          })

          console.log('loaded existing solutionSet and checked off pre-guessed words', this.bogdle.solutionSet)

          // set score to existing number of guessedWords
          _setScore(this.bogdle.config.guessedWords.length)
        } else {
          // set score back to 0
          console.log('found no pre-guessed words')
          _setScore(0)
        }
      }

      // shuffle tiles randomly
      _shuffleTiles()
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// debug: ask to create new bogdle
async function _confirmCreateNew() {
  this.myConfirm = new Modal('confirm-debug', 'Create New Bogdle?',
    'Are you <strong>sure</strong> you want to create a new Bogdle?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    var confirmed = await myConfirm.question()

    if (confirmed) {
      _resetProgress()
      _createNewSolutionSet()
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// debug: ask to reset config and LS
async function _confirmResetProgress() {
  this.myConfirm = new Modal('confirm-debug', 'Reset progress?',
    'Are you <strong>sure</strong> you want to reset your progress?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    var confirmed = await myConfirm.question()

    if (confirmed) {
      _resetProgress()
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// debug: reset config and LS
async function _resetProgress() {
  // console.log('resetting progress...')

  // set config to defaults
  this.bogdle.config = {
    "difficulty": this.bogdle.config.difficulty,
    "gameState": "IN_PROGRESS",
    "guessedWords": [],
    "lastCompletedTime": null,
    "lastPlayedTime": null
  }
  this.bogdle.statistics = {
    "gamesPlayed": 0,
    "wordsFound": 0
  }

  this.bogdle.dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[this.bogdle.config.difficulty]]}/words_3-${_getMaxWordLength()}.json`

  // save those defaults to local storage
  _saveGameState()

  // set score to 0
  _setScore(0)

  // re-enable DOM inputs
  _resetInput()

  // choose letters randomly from solution set
  _shuffleTiles()

  // open the help modal
  // modalOpen('start')
}

// change a setting (gear icon) value
async function _changeSetting(setting) {
  switch (setting) {
    case 'dark-mode':
      var st = document.getElementById('button-setting-dark-mode').dataset.status
      if (st == '' || st == 'false') {
        document.getElementById('button-setting-dark-mode').dataset.status = 'true'
        document.body.classList.add('dark-mode')
        _saveSetting(LS_DARK_KEY, true)
      } else {
        document.getElementById('button-setting-dark-mode').dataset.status = 'false'
        document.body.classList.remove('dark-mode')
        _saveSetting(LS_DARK_KEY, false)
      }

      break
    case 'difficulty':
      var oldDiff = this.bogdle.config.difficulty

      var elem = document.querySelectorAll('#container-difficulty input[type="radio"]:checked')
      var newDiff = elem[0].dataset.diffid

      // don't prompt unless new difficulty
      if (newDiff != oldDiff) {
        var mySubConfirm = new Modal('confirm', 'Change Difficulty?',
          'Changing the difficulty will start a new game, and the current game will be lost. Are you sure you want to do this?',
          'Yes, change the difficulty',
          'No, never mind'
        )

        try {
          // wait for modal confirmation
          var confirmed = await mySubConfirm.question()

          // if confirmed, set new difficulty and reset game
          if (confirmed) {
            this.bogdle.config.difficulty = newDiff

            // start a new game with newDiff (but using current startWord)
            _loadExistingSolutionSet(this.bogdle.startWord, true)
          } // if not confirmed, reset DOM radio back to original setting
          else {
            document.querySelector(`#container-difficulty input[data-diffid="${oldDiff}"]`).checked = true
          }
        } catch (err) {
          console.error('difficulty change failed', err)
        }
      }

      break
  }
}

// save a setting (gear icon) to localStorage
function _saveSetting(setting, value) {
  if (setting == LS_DARK_KEY) {
    localStorage.setItem(setting, value)
  }
}
// load settings (gear icon) from localStorage
function _loadSettings() {
  if (localStorage.getItem(LS_DARK_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_DARK_KEY))

    if (lsConfig) {
      document.body.classList.add('dark-mode')

      var setting = document.getElementById('button-setting-dark-mode')

      if (setting) {
        setting.dataset.status = 'true'
      }
    }
  }

  if (localStorage.getItem(LS_STATE_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_KEY))

    if (lsConfig) {
      if (lsConfig.difficulty) {
        var setting = document.querySelector(`#container-difficulty input[data-diffid="${lsConfig.difficulty}"]`)

        if(setting) {
          setting.checked = true
        }
      }
    }
  }
}

// increase score
function _increaseScore() {
  // get current score as an integer
  var curGuessed = parseInt(this.bogdle.dom.status.scoreGuessed.innerHTML)
  // increase and convert back to string
  this.bogdle.dom.status.scoreGuessed.innerHTML = (curGuessed + 1).toString()
}
// set score
function _setScore(guessed = 0) {
  // console.log('setting score...')

  // set UI elements
  this.bogdle.dom.status.scoreGuessed.innerHTML = guessed.toString()
  this.bogdle.dom.status.scoreGuessedOf.innerHTML = ' of '
  this.bogdle.dom.status.scoreTotal.innerHTML = __getSolutionSize().toString()
  this.bogdle.dom.status.scoreTotalWords.innerHTML = ' words'

  // if we're local and it doesn't exist
  // add the starter words for debugging
  if (this.bogdle.env == 'local') {
    var startDiv = document.getElementById('local-debug-start')

    if (!startDiv) {
      startDiv = document.createElement('div')
      startDiv.id = 'local-debug-start'
      startDiv.classList.add('debug')

      startDiv.innerHTML = Object.keys(this.bogdle.solutionSet[_getMaxWordLength()]).join(', ')

      this.bogdle.dom.status.score.append(startDiv)
    } else {
      startDiv.innerHTML = Object.keys(this.bogdle.solutionSet[_getMaxWordLength()]).join(', ')
    }
  }

  // console.log('!score set!', `${this.bogdle.dom.status.score.innerHTML}`)
}

// game state checking
function _checkGuess() {
  // reset classes
  this.bogdle.dom.status.guess.classList.remove('valid', 'first-guess')

  // player entered valid word length
  if (this.bogdle.dom.status.guess.innerHTML.length > 2) {
    var word = this.bogdle.dom.status.guess.innerHTML.trim()

    // player guessed a valid word
    Object.keys(this.bogdle.solutionSet).forEach(key => {
      if (parseInt(key) <= _getMaxWordLength()) {
        if (Object.keys(this.bogdle.solutionSet[key]).includes(word)) {
          this.bogdle.dom.status.guess.classList.toggle('valid')

          // and it's the first time
          if (!this.bogdle.solutionSet[key][word]) {
            this.bogdle.dom.status.guess.classList.add('first-guess')
            animateCSS('#guess', 'pulse')
          }
        } else {
          // player guessed an invalid word (not on list)
        }
      }
    })
  } else {
    // player guessed an invalid word (not long enough)
  }
}
function _checkWinState() {
  console.log('checking for win state...', this.bogdle.solutionSet)

  if (this.bogdle.solutionSet) {
    if (Object.values(this.bogdle.solutionSet).every((val) => val == 1)) {
      // console.log('_checkWinState(): game won!', this.bogdle.solutionSet)

      if (this.bogdle.config.gameState == 'IN_PROGRESS') {
        this.bogdle.statistics.gamesPlayed += 1
        this.bogdle.statistics = {
          "gamesPlayed": this.bogdle.statistics.gamesPlayed,
          "wordsFound": this.bogdle.statistics.wordsFound
        }

        _saveStats()
      }

      // display modal win thingy
      modalOpen('win')

      // set config stuff
      this.bogdle.config.gameState = 'GAME_OVER'

      if (this.bogdle.config.lastCompletedTime == null) {
        this.bogdle.config.lastCompletedTime = new Date().getTime()
      }

      _saveGameState()

      // disable inputs (until future daily re-enabling)
      _disableTiles()

      return true
    } else {
      console.log('_checkWinState(): game still in progress')
      return false
    }
  } else {
    return false
  }
}

// reset UI tiles to default state
function _resetInput() {
  _resetTiles()

  _resetGuess()
}
// disable all UI tiles
function _disableTiles() {
  Array.from(this.bogdle.dom.interactive.tiles).forEach(tile => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}
// set all tiles back to 'tbd'
function _resetTiles() {
  Array.from(this.bogdle.dom.interactive.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
}
// randomize the order of tiles
function _shuffleTiles() {
  let letters = this.bogdle.letters

  // shuffle order of letters
  var j, x, index;
  for (index = letters.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1));
    x = letters[index];
    letters[index] = letters[j];
    letters[j] = x;
  }

  // fill UI tiles with letters
  Array.from(this.bogdle.dom.interactive.tiles).forEach((tile, i) => {
    tile.innerHTML = letters[i]
  })

  // make sure game is playable again
  _resetInput()
}

// blank out the current DOM guess div
function _resetGuess() {
  this.bogdle.dom.status.guess.innerHTML = ''
  this.bogdle.dom.status.guess.classList.remove('valid')
}
// remove last letter in DOM guess div
function _removeLastLetter() {
  if (this.bogdle.config.gameState == 'IN_PROGRESS') {
    // remove last position from selected array
    if (this.bogdle.tilesSelected.length) {
      var last = this.bogdle.tilesSelected.pop()

      Array.from(this.bogdle.dom.interactive.tiles).forEach(tile => {
        if (tile.dataset.pos == last) {
          tile.dataset.state = 'tbd'
        }
      })
    }

    // remove last letter of active guess
    if (this.bogdle.dom.status.guess.innerHTML.length) {
      this.bogdle.dom.status.guess.innerHTML = this.bogdle.dom.status.guess.innerHTML.slice(0, this.bogdle.dom.status.guess.innerHTML.length - 1)

      _checkGuess()
    }
  }
}

// dynamically resize board depending on viewport
function _resizeBoard() {
  var boardContainer = document.querySelector('#board-container')
  var boardHeight = boardContainer.clientHeight

  var containerHeight = Math.min(Math.floor(boardHeight), 350)
  var tileHeight = 2.5 * Math.floor(containerHeight / 3)

  var board = document.querySelector('#board')
  board.style.width = `${containerHeight}px`
  board.style.height = `${tileHeight}px`
}

// user clicks a tile
function _onTileClick(tile) {
  var tileStatus = tile.target.dataset.state

  if (tileStatus == 'tbd') {
    animateCSS(`#${tile.target.id}`, 'pulse')

    // change tile status
    tile.target.dataset.state = 'selected'

    // push another selected tile onto selected array
    this.bogdle.tilesSelected.push(tile.target.dataset.pos)

    // add selected tile to guess
    this.bogdle.dom.status.guess.innerHTML += tile.target.innerHTML

    // check guess for validity
    _checkGuess()
  }
}

// modal: debug: pretty this.bogdle.config display
function _displayGameConfig() {
  var config = this.bogdle.config
  var dict = this.bogdle.dictionary
  var env = this.bogdle.env

  var html = '<dl>'
  html += `<dd><code>dictionary:</code></dd><dt>${dict}</dt>`
  html += `<dd><code>env:</code></dd><dt>${env}</dt>`

  Object.keys(config).forEach(key => {
    if (typeof config[key] == 'object'
      && !Array.isArray(config[key])
      && config[key] != null
    ) {
      html += `<dd><code>${key}: {</code><dl>`

      Object.keys(config[key]).forEach(k => {
        var label = k
        var value = config[key][k]

        if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
          value = __getFormattedDate(new Date(value))
        }

        html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
      })

      html += '</dl><code>}</code></dd>'
    } else {
      var label = key
      var value = config[key]

      if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
        if (value) {
          value = __getFormattedDate(new Date(value))
        }
      }

      html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
    }
  })

  html += '</dl>'

  return html
}
// modal: show how many words have been guessed
function _displayGameProgress() {
  var html = '<ul>'

  // check each length category (max...3, etc.)
  // total up words guessed in each
  Object.keys(this.bogdle.solutionSet).reverse().forEach(category => {
    html += `<li><span class="solution-category">${category}-LETTER</span>`

    var categoryEntries = Object.entries(this.bogdle.solutionSet[category])
    var categoryGuessed = categoryEntries
      .filter(entry => entry[1])

    categoryLength = Object.keys(this.bogdle.solutionSet[category])
      .length

    html += ` ${categoryGuessed.length} of ${categoryLength}`
    html += `<ul><li>`
    html += categoryGuessed.map(x => x[0].toUpperCase()).sort().join(', ')
    html += `</li></ul></li>`
  })

  html += '</ul>'

  return html
}
// modal: debug: pretty display of words in solution
function _displayGameSolution() {
  var html = `<h6>Difficulty: ${this.bogdle.config.difficulty}</h6>`

  html += '<ul>'

  // check each length category (max...3, etc.)
  Object.keys(this.bogdle.solutionSet).reverse().forEach(key => {
    if (key <= _getMaxWordLength()) {
      var words = []

      html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

      // create sorted array of each length category's words
      var sortedArr = Array.from(Object.keys(this.bogdle.solutionSet[key])).sort()

      // go through each word in each category
      sortedArr.forEach(word => {
        words.push(word.toUpperCase())
      })

      // add all the words to the markup
      html += words.join(', ')
      html += `</li></ul></li>`
    }
  })

  html += '</ul>'

  return html
}

// get max word length via difficulty setting
function _getMaxWordLength() {
  var diff = this.bogdle.config.difficulty

  // console.log('diff', diff)

  var max = DIFF_TO_LENGTH[diff]

  // console.log('max', max)

  return max
}

// save gamestate from code model -> LS
function _saveGameState() {
  console.log('saving to localStorage...', this.bogdle.config)

  // save game state
  try {
    localStorage.setItem(LS_STATE_KEY, JSON.stringify(this.bogdle.config))

    console.log('!localStorage progress saved!', JSON.parse(localStorage.getItem(LS_STATE_KEY)))
  } catch(error) {
    console.error(`localStorage could not be set for ${LS_STATE_KEY}`, error)
  }
}

// save statistics from code model -> LS
function _saveStats() {
  try {
    localStorage.setItem(LS_STATS_KEY, JSON.stringify(this.bogdle.statistics))

    // console.log('!localStorage progress saved!', JSON.parse(localStorage.getItem(LS_STATS_KEY)))
  } catch(error) {
    console.error(`localStorage could not be set for ${LS_STATS_KEY}`, error)
  }
}

// add event listeners to DOM
function _addEventListeners() {
  // [A] tile interaction
  Array.from(this.bogdle.dom.interactive.tiles).forEach(tile => {
    tile.addEventListener('click', (t) => {
      _onTileClick(t)
    })
  })

  // ❔ buttons to open modals
  this.bogdle.dom.interactive.btnHelp.addEventListener('click', () => modalOpen('help'))
  this.bogdle.dom.interactive.btnStats.addEventListener('click', () => modalOpen('stats'))
  this.bogdle.dom.interactive.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // ✅ submit word
  this.bogdle.dom.interactive.btnSubmit.addEventListener('click', () => {
    submitWord(this.bogdle.dom.status.guess.innerHTML)
  })

  // ⌫ backspace
  this.bogdle.dom.interactive.btnBackspace.addEventListener('click', () => {
    _removeLastLetter()
  })

  // X clear
  this.bogdle.dom.interactive.btnClearGuess.addEventListener('click', () => {
    _resetInput()
  })

  // 🔀 shuffle
  this.bogdle.dom.interactive.btnShuffle.addEventListener('click', () => {
    _shuffleTiles()
  })

  // := show current game word list progress
  this.bogdle.dom.interactive.btnShowProgress.addEventListener('click', () => {
    modalOpen('show-progress')
  })

  // local debug buttons
  if (this.bogdle.env == 'local') {
    if (this.bogdle.dom.interactive.debug.all) {
      // + create new solution
      this.bogdle.dom.interactive.debug.btnCreateNew.addEventListener('click', () => {
        _confirmCreateNew()
      })

      // := show list of words
      this.bogdle.dom.interactive.debug.btnShowList.addEventListener('click', () => {
        modalOpen('show-list')
      })

      // ⚙ show current bogdle config
      this.bogdle.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })

      // 🗑️ reset progress (i.e. set LS to defaults)
      this.bogdle.dom.interactive.debug.btnResetProgress.addEventListener('click', () => {
        _confirmResetProgress()
      })
    }
  }

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    if (event.code == 'Enter') {
      submitWord(this.bogdle.dom.status.guess.innerHTML)
    }
    if (event.code == 'Backspace' || event.code == 'Delete') {
      _removeLastLetter()
    }

    var excludedKeys = ['Alt', 'Control', 'Meta', 'Shift']
    var validLetters = this.bogdle.letters.map(l => l.toUpperCase())
    var pressedLetter = event.code.charAt(event.code.length - 1)

    if (!excludedKeys.some(key => !event.getModifierState(key))) {
      console.log('no modifier key is being held, so trigger letter')

      if (validLetters.includes(pressedLetter) && !event.getModifierState()) {
        // find any available tiles to select
        var boardTiles = Array.from(this.bogdle.dom.interactive.tiles)

        var availableTiles = boardTiles.filter(tile =>
          tile.innerHTML.toUpperCase() == pressedLetter &&
          tile.dataset.state == 'tbd'
        )

        // if we found one, select first found
        // this only works in Findle, not Bogdle
        if (availableTiles.length) {
          var tileToPush = availableTiles[0]

          tileToPush.dataset.state = 'selected'

          // push another selected tile onto selected array
          this.bogdle.tilesSelected.push(tileToPush.dataset.pos)

          // add selected tile to guess
          this.bogdle.dom.status.guess.innerHTML += tileToPush.innerHTML

          // check guess for validity
          _checkGuess()
        }
      }
    } else {
      console.log('a modifier key is being held, so ignore letter')
    }
  })

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', (event) => {
    var dialog = document.getElementsByClassName('thin-ui-modal-dialog')[0]

    if (dialog) {
      var isConfirm = dialog.classList.contains('modal-confirm')

      // only close if not a confirmation!
      if (event.target == dialog && !isConfirm) {
        dialog.remove()
      }
    }
  })

  window.onload = _resizeBoard
  window.onresize = _resizeBoard

  // console.log('added event listeners')
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

// load random start word for solution set
async function __getNewStartWord() {
  // gets max-length start words via fetch()
  // if success, grabs a random one

  const response = await fetch(this.bogdle.startWordsFile)
  const responseJson = await response.json()

  // random max-length word
  let possibles = responseJson['9']
  let possibleIdx = Math.floor(Math.random() * possibles.length)

  this.startWord = possibles[possibleIdx]

  return this.startWord
}

// timestamp to display date
function __getFormattedDate(date) {
  var formatted_date = ''

  formatted_date += `${date.getFullYear()}/`
  formatted_date += `${(date.getMonth() + 1).toString().padStart(2, '0')}/` // months are 0-indexed!
  formatted_date += `${date.getDate().toString().padStart(2, '0')} `
  formatted_date += `${date.getHours().toString().padStart(2, '0')}:`
  formatted_date += `${date.getMinutes().toString().padStart(2, '0')}:`
  formatted_date += `${date.getSeconds().toString().padStart(2, '0')}`

  return formatted_date
}

// return this.bogdle.solutionSet size
function __getSolutionSize() {
  let categorySize = 0
  let solutionSize = 0

  Object.keys(this.bogdle.solutionSet).forEach(category => {
    if (parseInt(category) <= _getMaxWordLength()) {
      categorySize = Object.keys(this.bogdle.solutionSet[category]).length
      solutionSize += categorySize
    }
  })

  // console.log('__getSolutionSize()', solutionSize)

  return solutionSize
}

// set up game
this.bogdle.init()
