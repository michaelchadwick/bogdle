this.bogdle = this.bogdle || {}

this.bogdle.env = 'local'
this.bogdle.difficulty = 'normal'

// dictionary to pull from
// this.bogdle.dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[this.bogdle.difficulty]]}/words_3-${MAX_WORD_LENGTH}.json`
this.bogdle.dictionary = `./assets/json/01_sm/words_3-9.json`

this.bogdle.startWordsFile = './assets/json/'
this.bogdle.startWordsFile += WORD_SOURCES[DIFFICULTY[this.bogdle.difficulty]]
this.bogdle.startWordsFile += `/words_${MAX_WORD_LENGTH}-${MAX_WORD_LENGTH}.json`

this.bogdle.startWord = 'patterned'
this.bogdle.startWord = 'education'
this.bogdle.tilesSelected = []
this.bogdle.solutionSet = EMPTY_OBJ_SET

// default settings
this.bogdle.config = {
  "gameState": "IN_PROGRESS",
  "guessedWords": [],
  "lastCompletedTime": null,
  "lastPlayedTime": null
}
this.bogdle.statistics = {
  "gamesPlayed": 0,
  "wordsFound": 0
}

// status DOM elements
this.bogdle.score = document.getElementById('score-container')
this.bogdle.scoreGuessed = document.getElementById('score-guessed')
this.bogdle.scoreGuessedOf = document.getElementById('score-guessed-of')
this.bogdle.scoreTotal = document.getElementById('score-total')
this.bogdle.scoreTotalWords = document.getElementById('score-total-words')
this.bogdle.guess = document.getElementById('guess')

// clickable DOM buttons
this.bogdle.buttons = {
  "btnHelp": document.getElementById('button-help'),
  "btnStats": document.getElementById('button-stats'),
  "btnSettings": document.getElementById('button-settings'),
  "btnSubmit": document.getElementById('button-submit'),
  "btnBackspace": document.getElementById('button-backspace'),
  "btnClearGuess": document.getElementById('button-clear-guess'),
  "btnShuffle": document.getElementById('button-shuffle'),
  "btnShowProgress": document.getElementById('button-show-progress')
}

this.bogdle.buttons.debug = {
  "all": document.getElementById('debug-buttons'),
  "btnCreateNew": document.getElementById('button-create-new'),
  "btnShowList": document.getElementById('button-show-list'),
  "btnResetProgress": document.getElementById('button-reset-progress'),
  "btnModalOpen": document.getElementById('select-modal-open')
}

// board tiles
this.bogdle.letters = []
this.bogdle.tiles = document.getElementsByClassName('tile')

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
                  <div id="button-setting-dark-mode" data-status="" class="switch" onclick="_toggleSetting('dark-mode')">
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
                <div class="container">
                  <div class="radio">
                    <input id="diff-1" name="diff-radio" type="radio">
                    <label for="diff-1" class="radio-label">Kid (3)</label>
                  </div>

                  <div class="radio">
                    <input id="diff-2" name="diff-radio" type="radio">
                    <label for="diff-2" class="radio-label">Easy (5)</label>
                  </div>

                  <div class="radio">
                    <input id="diff-3" name="diff-radio" type="radio">
                    <label for="diff-3" class="radio-label">Med (7)</label>
                  </div>

                  <div class="radio">
                    <input id="diff-4" name="diff-radio" type="radio" checked>
                    <label for="diff-4" class="radio-label">Normal (9)</label>
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
        getGameProgress(),
        null,
        null
      )
      break
    case 'show-list':
      this.myModal = new Modal('perm-debug', 'Master Word List',
        getGameSolution(),
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

function getGameProgress() {
  var html = '<ul>'

  // check each length category (MAX_WORD_LENGTH...3, etc.)
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

function getGameSolution() {
  var html = '<ul>'

  // check each length category (MAX_WORD_LENGTH...3, etc.)
  Object.keys(this.bogdle.solutionSet).reverse().forEach(key => {
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
  })

  html += '</ul>'

  return html
}

// submit a guess
function submitWord(word) {
  // console.log('submitting word...', word)

  if (this.bogdle.config.gameState == 'IN_PROGRESS') {
    if (word.length > 2) {
      if (typeof this.bogdle.solutionSet[word.length][word] != 'undefined') {
        if (this.bogdle.solutionSet[word.length][word] !== 1) {
          this.bogdle.solutionSet[word.length][word] = 1
          this.bogdle.config.guessedWords.push(word)
          this.bogdle.config.guessedWords.sort()
          this.bogdle.config.lastPlayedTime = new Date().getTime()
          this.bogdle.statistics.wordsFound += 1

          animateCSS('#guess', 'tada')

          _saveGameState()

          _increaseScore()

          this.bogdle.guess.classList.remove('first-guess')

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

// get list of words already guessed correctly
function getGuessedWords() {
  // get words from solution set
  let solutionKeys = Object.keys(this.bogdle.solutionSet)

  // only return words equal to 1 (i.e. guessed correctly)
  return solutionKeys.filter(k => this.bogdle.solutionSet[k])
}

// start the engine
this.bogdle.init = async () => {
  // console.log('init started')

  // set env
  this.bogdle.env = document.location.hostname == ENV_PROD_URL ? 'prod' : 'local'

  // if local dev
  if (this.bogdle.env == 'local') {
    // if debug buttons are in template
    if (this.bogdle.buttons.debug.all) {
      // show debug buttons
      this.bogdle.buttons.debug.all.style.display = 'flex'
      // make header buttons smaller to fit in debug buttons
      document.querySelectorAll('button.icon').forEach((btn) => {
        btn.style.fontSize = '16px'
      })
    }
  }

  // attach event listeners to UI elements
  _addEventListeners()

  if (this.bogdle.env == 'prod') {
    await _loadRealSolutionSet(this.bogdle.startWord)
  } else {
    await _loadTestSolutionSet(this.bogdle.startWord)
  }

  // console.log('!bogdle has been initialized!')
}

/*************************************************************************
 * private methods *
 *************************************************************************/

function _loadSettings() {
  if (localStorage.getItem(LS_DARK_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_DARK_KEY))

    if (lsConfig) {
      document.body.classList.add('dark-mode')

      var sw = document.getElementById('button-setting-dark-mode')

      if (sw) {
        sw.dataset.status = 'true'
      }
    }
  }

  if (localStorage.getItem(LS_STATE_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_KEY))

    if (lsConfig) {
      document.body.classList.add('dark-mode')

      var sw = document.getElementById('button-setting-dark-mode')

      if (sw) {
        sw.dataset.status = 'true'
      }
    }
  }
}

// load test solution set using static word
async function _loadTestSolutionSet(newWord) {
  // createBogdle()

  try {
    // TODO add a throbber type to modal.js
    // modalOpen('loading', false, true)

    const findle = await createFindle(newWord, this.bogdle.dictionary)

    if (findle) {
      /*********************************************************************
       * set Bogdle solution                                               *
       * -------------------                                               *
       * load object of arrays (e.g. {"3":['aaa'],"4":['aaaa']})           *
       * turn into object of objects (e.g. {"3":{'aaa':0},"4":{'aaaa':0}}) *
       *********************************************************************/

      // get a range of object keys from 3..MAX_WORD_LENGTH
      var categories = Array.from({length: MAX_WORD_LENGTH - 2}, (x, i) => (i + 3).toString());

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

      // set Bogdle letters
      this.bogdle.letters = newWord.split('')

      // choose letters randomly from solution set
      _shuffleTiles()

      _loadGameState()
    }
  } catch (err) {
    console.error('could not create new Findle', err)
  }

}

// load random start word for solution set
async function _getNewStartWord() {
  // gets MAX-letter start words via fetch()
  // if success, grabs a random one
  const response = await fetch(this.bogdle.startWordsFile)
  const responseJson = await response.json()
  // random MAX_WORD_LENGTH word
  let possibles = responseJson[MAX_WORD_LENGTH.toString()]
  let possibleIdx = Math.floor(Math.random() * possibles.length)

  this.startWord = possibles[possibleIdx]

  return this.startWord
}

// load (today's) solution set from json asynchronously
async function _loadRealSolutionSet() {
  // console.log('new solution requested asynchronously...')

  // createBogdle()

  try {
    const newWord = await _getNewStartWord()

    try {
      // TODO add a throbber type to modal.js
      // modalOpen('loading', false, true)

      const findle = await createFindle(newWord, this.bogdle.dictionary)

      if (findle) {
        /*********************************************************************
         * set Bogdle solution                                               *
         * -------------------                                               *
         * load object of arrays (e.g. {"3":['aaa'],"4":['aaaa']})           *
         * turn into object of objects (e.g. {"3":{'aaa':0},"4":{'aaaa':0}}) *
         *********************************************************************/

        // get a range of object keys from 3...MAX_WORD_LENGTH
        var categories = Array.from({length: MAX_WORD_LENGTH - 2}, (x, i) => (i + 3).toString());

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

        console.log('real: this.bogdle.solutionSet', this.bogdle.solutionSet)

        // set Bogdle letters
        this.bogdle.letters = newWord.split('')

        _shuffleTiles()

        _resetProgress()

        // _loadGameState()
      }
    } catch (err) {
      console.error('could not create new Findle', err)
    }
  } catch (err) {
    console.error('could not get new start word', err)
  }
}

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
      _loadRealSolutionSet()
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// ask to reset config and LS
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

function _resetProgress() {
  // console.log('resetting progress...')

  // set config to defaults
  this.bogdle.config = {
    "gameState": "IN_PROGRESS",
    "guessedWords": [],
    "lastCompletedTime": null,
    "lastPlayedTime": null
  }

  // save those defaults to local storage
  _saveGameState()

  // set solution set statuses back to 0
  Object.keys(this.bogdle.solutionSet).forEach(key => {
    Object.keys(this.bogdle.solutionSet[key]).forEach(status => {
      this.bogdle.solutionSet[key][status] = 0
    })
  })

  console.log(this.bogdle.solutionSet)

  // set score to 0
  _setScore(0)

  // re-enable DOM inputs
  _resetInput()

  // open the help modal
  modalOpen('start')

  // console.log('!progress reset!')
}

// return solutionSet size
function _solutionSize() {
  let categorySize = 0
  let solutionSize = 0

  Object.keys(this.bogdle.solutionSet).forEach(category => {
    categorySize = Object.keys(this.bogdle.solutionSet[category]).length
    solutionSize += categorySize
  })

  // console.log('_solutionSize()', solutionSize)

  return solutionSize
}

// increase score
function _increaseScore() {
  // get current score as an integer
  var curGuessed = parseInt(this.bogdle.scoreGuessed.innerHTML)
  // increase and convert back to string
  this.bogdle.scoreGuessed.innerHTML = (curGuessed + 1).toString()
}
// set score
function _setScore(guessed = 0) {
  // console.log('setting score...')

  // set UI elements
  this.bogdle.scoreGuessed.innerHTML = guessed.toString()
  this.bogdle.scoreGuessedOf.innerHTML = ' of '
  this.bogdle.scoreTotal.innerHTML = _solutionSize().toString()
  this.bogdle.scoreTotalWords.innerHTML = ' words'

  // if we're local and it doesn't exist
  // add the starter words for debugging
  if (this.bogdle.env == 'local') {
    var startDiv = document.getElementById('local-debug-start')

    if (!startDiv) {
      startDiv = document.createElement('div')
      startDiv.id = 'local-debug-start'
      startDiv.classList.add('debug')
      startDiv.innerHTML = Object.keys(this.bogdle.solutionSet[MAX_WORD_LENGTH.toString()]).join(', ')
      // startDiv.innerHTML = this.bogdle.startWord

      this.bogdle.score.append(startDiv)
    } else {
      startDiv.innerHTML = Object.keys(this.bogdle.solutionSet[MAX_WORD_LENGTH.toString()]).join(', ')
      // startDiv.innerHTML = this.bogdle.startWord
    }
  }

  // console.log('!score set!', `${this.bogdle.score.innerHTML}`)
}

// game state checking
function _checkGuess() {
  // reset classes
  this.bogdle.guess.classList.remove('valid', 'first-guess')

  // player entered valid word length
  if (this.bogdle.guess.innerHTML.length > 2) {
    var word = this.bogdle.guess.innerHTML.trim()

    // player guessed a valid word
    Object.keys(this.bogdle.solutionSet).forEach(key => {
      if (Object.keys(this.bogdle.solutionSet[key]).includes(word)) {
        this.bogdle.guess.classList.toggle('valid')

        // and it's the first time
        if (!this.bogdle.solutionSet[key][word]) {
          this.bogdle.guess.classList.add('first-guess')
          animateCSS('#guess', 'pulse')
        }
      } else {
        // player guessed an invalid word (not on list)
      }
    })
  } else {
    // player guessed an invalid word (not long enough)
  }
}
function _checkWinState() {
  // console.log('checking for win state...', this.bogdle.solutionSet)

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
  } else {
    // console.log('_checkWinState(): game still in progress')
  }
}

// reset UI tiles to default state
function _resetInput() {
  _resetTiles()

  _resetGuess()
}
// disable all UI tiles
function _disableTiles() {
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}
function _resetTiles() {
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
}
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
  Array.from(this.bogdle.tiles).forEach((tile, i) => {
    tile.innerHTML = letters[i]
  })

  // make sure game is playable again
  _resetInput()
}
function _resetGuess() {
  this.bogdle.guess.innerHTML = ''
  this.bogdle.guess.classList.remove('valid')
}

// remove last letter in DOM guess div
function _removeLastLetter() {
  if (this.bogdle.config.gameState == 'IN_PROGRESS') {
    // remove last position from selected array
    if (this.bogdle.tilesSelected.length) {
      var last = this.bogdle.tilesSelected.pop()

      Array.from(this.bogdle.tiles).forEach(tile => {
        if (tile.dataset.pos == last) {
          tile.dataset.state = 'tbd'
        }
      })
    }

    // remove last letter of active guess
    if (this.bogdle.guess.innerHTML.length) {
      this.bogdle.guess.innerHTML = this.bogdle.guess.innerHTML.slice(0, this.bogdle.guess.innerHTML.length - 1)

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

function _clickTile(tile) {
  var tileStatus = tile.target.dataset.state

  if (tileStatus == 'tbd') {
    animateCSS(`#${tile.target.id}`, 'pulse')

    // change tile status
    tile.target.dataset.state = 'selected'

    // push another selected tile onto selected array
    this.bogdle.tilesSelected.push(tile.target.dataset.pos)

    // add selected tile to guess
    this.bogdle.guess.innerHTML += tile.target.innerHTML

    // check guess for validity
    _checkGuess()
  }
}

function _toggleSetting(setting) {
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
  }
}
function _saveSetting(setting, value) {
  localStorage.setItem(setting, value)
}

// save gamestate from code model -> LS
function _saveGameState() {
  // console.log('saving to localStorage...')

  // save game state
  try {
    localStorage.setItem(LS_STATE_KEY, JSON.stringify(this.bogdle.config))

    // console.log('!localStorage progress saved!', JSON.parse(localStorage.getItem(LS_STATE_KEY)))
  } catch(error) {
    console.error(`localStorage could not be set for ${LS_STATE_KEY}`, error)
  }
}
// load state/statistics from LS -> code model
function _loadGameState() {
  // console.log('loading progress...')

  // load game state
  if (localStorage.getItem(LS_STATE_KEY)) {
    // console.log('localStorage key found and loading...')

    var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_KEY))

    // set game state
    this.bogdle.config.gameState = lsConfig.gameState

    // check off any pre-guessed words
    this.bogdle.guessedWords = []
    lsConfig.guessedWords.forEach(word => {
      this.bogdle.config.guessedWords.push(word)
      this.bogdle.solutionSet[word.length][word] = 1
    })
    this.bogdle.guessedWords.sort()

    // set last completed
    this.bogdle.config.lastCompletedTime = lsConfig.lastCompletedTime
    // set last played
    this.bogdle.config.lastPlayedTime = lsConfig.lastPlayedTime

    // never played before? show help modal
    if (this.bogdle.config.lastPlayedTime == null) {
      modalOpen('help')
    }

    // console.log('!localStoragekey loaded!', JSON.parse(localStorage.getItem(LS_STATE_KEY)))
  } else {
    // console.log('no localStorage key found; defaults being set')
    modalOpen('help')

    _saveGameState()
  }

  // load user statistics
  if (localStorage.getItem(LS_STATS_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_STATS_KEY))

    this.bogdle.statistics = {
      "gamesPlayed": lsConfig.gamesPlayed,
      "wordsFound": lsConfig.wordsFound
    }
  }

  // load game settings
  _loadSettings()

  _setScore(this.bogdle.config.guessedWords.length)

  _checkWinState()

  // console.log('!progress loaded!', this.bogdle.solutionSet)
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
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.addEventListener('click', (t) => {
      _clickTile(t)
    })
  })

  // ❔ buttons to open modals
  this.bogdle.buttons.btnHelp.addEventListener('click', () => modalOpen('help'))
  this.bogdle.buttons.btnStats.addEventListener('click', () => modalOpen('stats'))
  this.bogdle.buttons.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // ✅ submit word
  this.bogdle.buttons.btnSubmit.addEventListener('click', () => {
    submitWord(this.bogdle.guess.innerHTML)
  })

  // ⌫ backspace
  this.bogdle.buttons.btnBackspace.addEventListener('click', () => {
    _removeLastLetter()
  })

  // X clear
  this.bogdle.buttons.btnClearGuess.addEventListener('click', () => {
    _resetInput()
  })

  // 🔀 shuffle
  this.bogdle.buttons.btnShuffle.addEventListener('click', () => {
    _shuffleTiles()
  })

  // := show current game word list progress
  this.bogdle.buttons.btnShowProgress.addEventListener('click', () => {
    modalOpen('show-progress')
  })

  // local debug buttons
  if (this.bogdle.env == 'local') {
    if (this.bogdle.buttons.debug.all) {
      // + create new solution
      this.bogdle.buttons.debug.btnCreateNew.addEventListener('click', () => {
        _confirmCreateNew()
      })

      // := show list of words
      this.bogdle.buttons.debug.btnShowList.addEventListener('click', () => {
        modalOpen('show-list')
      })

      // 🗑️ reset progress (i.e. set LS to defaults)
      this.bogdle.buttons.debug.btnResetProgress.addEventListener('click', () => {
        _confirmResetProgress()
      })

      // [-] modal select
      this.bogdle.buttons.debug.btnModalOpen.addEventListener('change', (event) => {
        modalOpen(event.target.value)
      })
    }
  }

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    if (event.code == 'Enter') {
      submitWord(this.bogdle.guess.innerHTML)
    }
    if (event.code == 'Backspace' || event.code == 'Delete') {
      _removeLastLetter()
    }

    var validLetters = this.bogdle.letters.map(l => l.toUpperCase())
    var pressedLetter = event.code.charAt(event.code.length - 1)

    if (validLetters.includes(pressedLetter)) {
      // console.log('letter in bogdle pressed', pressedLetter)

      // find any available tiles to select
      var boardTiles = Array.from(this.bogdle.tiles)

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
      this.bogdle.guess.innerHTML += tileToPush.innerHTML

      // check guess for validity
      _checkGuess()
      }
    }
  })

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', (event) => {
    var dialog = document.getElementsByClassName('thin-ui-modal-dialog')[0]
    if (event.target == dialog) {
      dialog.remove()
    }
  })

  window.onload = _resizeBoard
  window.onresize = _resizeBoard

  // console.log('added event listeners')
}

// set up game
this.bogdle.init()
