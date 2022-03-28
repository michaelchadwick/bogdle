let LS_STATE_KEY = 'bogdle-state'
let LS_STATS_KEY = 'bogdle-statistics'

this.bogdle = this.bogdle || {}

this.bogdle.tilesSelected = []
this.bogdle.solutionSet = { "3": {}, "4": {}, "5": {}, "6": {}, "7": {}, "8": {}, "9": {} }
this.bogdle.solutionSize = 0

// default settings
this.bogdle.config = {
  "gameState": "IN_PROGRESS",
  "guessedWords": [],
  "lastCompletedTime": null,
  "lastPlayedTime": null
}
this.bogdle.statistics = {
  "gamesPlayed": 0,
  "winPercentage": 0,
  "currentStreak": 0,
  "maxStreak": 0
}

// status DOM elements
this.bogdle.scoreGuessed = document.getElementById('score-guessed')
this.bogdle.scoreTotal = document.getElementById('score-total')
this.bogdle.guess = document.getElementById('guess')

// clickable DOM buttons
this.bogdle.buttons = {
  "btnHelp": document.getElementById('button-help'),
  "btnStats": document.getElementById('button-stats'),
  "btnSettings": document.getElementById('button-settings'),
  "btnSubmit": document.getElementById('buttonSubmit'),
  "btnBackspace": document.getElementById('buttonBackspace'),
  "btnShuffle": document.getElementById('buttonShuffle'),
  "btnShowList": document.getElementById('buttonShowList'),
  "btnResetProgress": document.getElementById('buttonResetProgress'),
  "btnCreateNew": document.getElementById('buttonCreateNew'),
  "btnModalClose": document.getElementById('bogdle-modal-close')
}

// board tiles
this.bogdle.letters = ['c', 'a', 't', 'a', 'm', 'a', 'r', 'a', 'n']
this.bogdle.tiles = document.getElementsByClassName('tile')

/******************
 * public methods *
 ******************/

// modals
this.bogdle.modal = document.getElementById('bogdle-modal')
this.bogdle.modalBody = document.getElementById('bogdle-modal-body')

// modals
function modalOpen(type, noOverlay) {
  this.bogdle.modal.style.display = 'flex';

  if (noOverlay) {
    if (!this.bogdle.modal.classList.contains('temp')) {
      this.bogdle.modal.classList.add('temp')
    }
  } else {
    this.bogdle.modal.classList.remove('temp')
  }

  switch(type) {
    case 'invalid-length':
      this.bogdle.modalBody.innerHTML = `
        Error: Needs to be 3 or more characters.
      `
      setTimeout(function() {
        this.bogdle.modal.style.display = 'none'
        this.bogdle.modal.classList.remove('temp')
      }, 1500)
      break
    case 'invalid-word':
      this.bogdle.modalBody.innerHTML = `
        Error: Not in word list.
      `
      setTimeout(function() {
        this.bogdle.modal.style.display = 'none'
        this.bogdle.modal.classList.remove('temp')
      }, 1500)
      break
    case 'repeated-word':
      this.bogdle.modalBody.innerHTML = `
        Word already found!
      `
      setTimeout(function() {
        this.bogdle.modal.style.display = 'none'
        this.bogdle.modal.classList.remove('temp')
      }, 1500)
      break
    case 'show-list':
      this.bogdle.modalBody.innerHTML = getSolutionSetDisplay()
      break
    case 'help':
      this.bogdle.modalBody.innerHTML = `
        <h2>How to play Bogdle</h2>

        <p>Find all the words in the jumble of letters! Each word is between 3 and 9 letters long.</p>

        <p>After each word is found, the counter of words out of the total words will increase. Find all valid words and win!</p>

        <hr />

        <p>A new BOGDLE will be available each day!</p>
      `
      break
    case 'stats':
    case 'win':
      this.bogdle.modalBody.innerHTML = `
        <h2>Statistics</h2>
        <div class="container">
          <div id="statistics">
            <div class="statistic-container">
              <div class="statistic">${this.bogdle.statistics.gamesPlayed}</div>
              <div class="statistic-label">Played</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${this.bogdle.statistics.winPercentage}</div>
              <div class="statistic-label">Win %</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${this.bogdle.statistics.currentStreak}</div>
              <div class="statistic-label">Current Streak</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${this.bogdle.statistics.maxStreak}</div>
              <div class="statistic-label">Max Streak</div>
            </div>
          </div>
        </div>
      `
      break
    case 'settings':
      this.bogdle.modalBody.innerHTML = `
        <h2>Settings</h2>
        <p>None yet!</p>
      `
      break
  }
}
function modalClose() {
  this.bogdle.modal.style.display = 'none';
}

function getSolutionSetDisplay() {
  var html = '<ul>'

  Object.keys(this.bogdle.solutionSet).forEach(key => {
    html += `<li><strong>${key}</strong><ul>`
    Object.keys(this.bogdle.solutionSet[key]).forEach(word => {
      html += `  <li>${word}</li>`
    })
    html += `</ul></li>`
  })

  html += '</ul>'

  return html
}

// remove last letter in DOM guess div
function removeLastGuessLetter() {
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

// submit a guess
function submitWord(word) {
  // console.log('submitting word...', word)

  if (this.bogdle.config.gameState == 'IN_PROGRESS') {
    if (word.length > 2) {
      if (typeof this.bogdle.solutionSet[word.length][word] != 'undefined') {
        if (this.bogdle.solutionSet[word] !== 1) {
          // console.log('!new word submitted successfully!')

          this.bogdle.solutionSet[word] = 1
          this.bogdle.config.guessedWords.push(word)
          this.bogdle.config.guessedWords.sort()
          this.bogdle.config.lastPlayedTime = new Date().getTime()

          saveState()

          _increaseScore()
          _resetInput()

          _checkWinState()
        } else {
          console.error('word already guessed!')
          modalOpen('repeated-word', true)
        }
      } else {
        // console.error('word not in list!')
        modalOpen('invalid-word', true)
      }
    } else {
      // console.error('guess too short!')
      modalOpen('invalid-length', true)
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

// save state from code model -> LS
function saveState() {
  // console.log('saving to localStorage...')

  // save game state
  try {
    localStorage.setItem(LS_STATE_KEY, JSON.stringify(this.bogdle.config))

    // console.log('!localStorage progress saved!', JSON.parse(localStorage.getItem(LS_STATE_KEY)))
  } catch(error) {
    console.error(`localStorage could not be set for ${LS_STATE_KEY}`, error)
  }
}

// save statistics from code model -> LS
function saveStats() {
  try {
    localStorage.setItem(LS_STATS_KEY, JSON.stringify(this.bogdle.statistics))

    // console.log('!localStorage progress saved!', JSON.parse(localStorage.getItem(LS_STATS_KEY)))
  } catch(error) {
    console.error(`localStorage could not be set for ${LS_STATS_KEY}`, error)
  }
}

// load state/statistics from LS -> code model
function loadState() {
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

    saveState()
  }

  // load user statistics
  if (localStorage.getItem(LS_STATS_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_STATS_KEY))

    this.bogdle.statistics = {
      "gamesPlayed": lsConfig.gamesPlayed,
      "winPercentage": lsConfig.winPercentage,
      "currentStreak": lsConfig.currentStreak,
      "maxStreak": lsConfig.maxStreak
    }
  }

  _setScore(this.bogdle.config.guessedWords.length.toString())

  _checkWinState()

  // console.log('!progress loaded!', this.bogdle.solutionSet)
}

// start the engine
this.bogdle.init = () => {
  // console.log('init started')

  _addEventListeners()

  // gets solution set via fetch()
  // if success, load any LS progress and set score display
  _loadSolutionSet()

  // choose letters randomly from set
  _shuffleTiles()

  // console.log('!bogdle inited!')
}

/*******************
 * private methods *
 *******************/

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
  saveState()

  // set score to 0
  _setScore('0')
  // re-enable DOM inputs
  _resetInput()

  // console.log('!progress reset!')
}

// increase score
function _increaseScore() {
  // get current score as an integer
  var curGuessed = parseInt(this.bogdle.scoreGuessed.innerHTML)
  // increase and convert back to string
  this.bogdle.scoreGuessed.innerHTML = (curGuessed + 1).toString()
}
// set score
function _setScore(guessed) {
  // console.log('setting score...')

  this.bogdle.scoreGuessed.innerHTML = guessed

  this.bogdle.solutionSize = 0

  Object.keys(this.bogdle.solutionSet).forEach(key => {
    var letterLength = Object.keys(this.bogdle.solutionSet[key]).length
    this.bogdle.solutionSize += letterLength
  })

  this.bogdle.scoreTotal.innerHTML = this.bogdle.solutionSize

  // console.log('!score set!', `${this.bogdle.scoreGuessed.innerHTML} of ${this.bogdle.scoreTotal.innerHTML}`)
}

// game state checking
function _checkGuess() {
  // reset classes
  this.bogdle.guess.classList.remove('valid', 'first-guess', 'not-first-guess')

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
        } else {
          this.bogdle.guess.classList.add('not-first-guess')
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
        "winPercentage": 100,
        "currentStreak": this.bogdle.statistics.gamesPlayed,
        "maxStreak": this.bogdle.statistics.gamesPlayed
      }

      saveStats()
    }

    // display modal win thingy
    modalOpen('win')

    // set config stuff
    this.bogdle.config.gameState = 'GAME_OVER'

    if (this.bogdle.config.lastCompletedTime == null) {
      this.bogdle.config.lastCompletedTime = new Date().getTime()
    }

    saveState()

    // disable inputs (until future daily re-enabling)
    _disableTiles()
  } else {
    // console.log('_checkWinState(): game still in progress')
  }
}

// internal DOM reset methods
function _resetInput() {
  // reset tiles
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
  // reset guess
  this.bogdle.guess.innerHTML = ''
  this.bogdle.guess.classList.remove('valid')
}
// shuffle all tiles
function _shuffleTiles() {
  let letters = this.bogdle.letters

  var j, x, index;
  for (index = letters.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1));
    x = letters[index];
    letters[index] = letters[j];
    letters[j] = x;
  }

  Array.from(this.bogdle.tiles).forEach((tile, i) => {
    tile.innerHTML = letters[i]
  })

  _resetInput()
}

// disable all tiles
function _disableTiles() {
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}

// load (today's) solution set from json
function _loadSolutionSet() {
  // console.log('loading solution set...')

  fetch('./assets/json/words_3-3_some.json')
    .then((response) => {
      // console.log('_loadSolutionSet() got json')

      return response.json()
    }).then((solutionSet) => {
      // load an object of arrays (e.g. { "3": ['aaa'], "4": ['aaaa'] })
      // and turn it into an object of objects (e.g. { "3": { 'aaa': 0 }, "4": { 'aaaa': 0 } })
      Object.keys(solutionSet).forEach(key => {
        solutionSet[key].forEach(word => {
          if (!this.bogdle.solutionSet[key.toString()][word]) {
            this.bogdle.solutionSet[key.toString()][word] = {}
          }

          this.bogdle.solutionSet[key.toString()][word] = 0
        })
      })

      this.bogdle.solutionSize = 0

      Object.keys(this.bogdle.solutionSet).forEach(key => {
        var letterLength = Object.keys(this.bogdle.solutionSet[key]).length
        this.bogdle.solutionSize += letterLength
      })

      //console.log('!solution set loaded!', this.bogdle.solutionSet, this.bogdle.solutionSize)

      loadState()
    }).catch((err) => {
      console.error('solution set could not be loaded', err)
    })
}

function _resizeBoard() {
  var boardContainer = document.querySelector('#board-container')

  var containerHeight = Math.min(Math.floor(boardContainer.clientHeight), 350)
  var tileHeight = 2.5 * Math.floor(containerHeight / 3)

  var board = document.querySelector('#board')
  board.style.width = `${containerHeight}px`
  board.style.height = `${tileHeight}px`
}

// add event listeners to DOM
function _addEventListeners() {
  // tile interaction
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.addEventListener('click', (t) => {
      var tileStatus = t.target.dataset.state

      if (tileStatus == 'tbd') {
        // change tile status
        t.target.dataset.state = 'selected'

        // push another selected tile onto selected array
        this.bogdle.tilesSelected.push(t.target.dataset.pos)

        // add selected tile to guess
        this.bogdle.guess.innerHTML += t.target.innerHTML

        _checkGuess()
      }
    })
  })

  // ❔ buttons to open modals
  this.bogdle.buttons.btnHelp.addEventListener('click', () => modalOpen('help'))
  this.bogdle.buttons.btnStats.addEventListener('click', () => modalOpen('stats'))
  this.bogdle.buttons.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // ❌ modal close button
  this.bogdle.buttons.btnModalClose.addEventListener('click', () => {
    modalClose()
  })

  // ✅ submit word
  this.bogdle.buttons.btnSubmit.addEventListener('click', () => {
    submitWord(this.bogdle.guess.innerHTML)
  })

  // ⌫ backspace
  this.bogdle.buttons.btnBackspace.addEventListener('click', () => {
    removeLastGuessLetter()
  })

  // 🔀 shuffle
  this.bogdle.buttons.btnShuffle.addEventListener('click', () => {
    _shuffleTiles()
  })

  // + create new solution
  this.bogdle.buttons.btnCreateNew.addEventListener('click', () => {
    // createBogdle()
    createFindle()
      .then((findle) => {
        if (findle) {
          this.bogdle.solutionSet = findle
          this.bogdle.solutionSize = 0

          Object.keys(findle).forEach(key => {
            this.bogdle.solutionSize += findle[key].length
          })

          _setScore(this.bogdle.config.guessedWords.length.toString())
        }
      }).catch(err => {
        console.error('could not create new solution set', err)
      })
  })

  // := show list of words
  this.bogdle.buttons.btnShowList.addEventListener('click', () => {
    modalOpen('show-list')
  })

  // 🗑️ reset progress (i.e. set LS to defaults)
  this.bogdle.buttons.btnResetProgress.addEventListener('click', () => {
    _resetProgress()
  })

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    if (event.code == 'Enter') {
      submitWord(this.bogdle.guess.innerHTML)
    }
    if (event.code == 'Backspace' || event.code == 'Delete') {
      removeLastGuessLetter()
    }
  })

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', (event) => {
    if (event.target == this.bogdle.modal) {
      this.bogdle.modal.style.display = 'none';
    }
  })

  window.onload = _resizeBoard
  window.onresize = _resizeBoard

  // console.log('added event listeners')
}

// set up game
this.bogdle.init()
