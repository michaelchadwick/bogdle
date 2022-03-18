this.bogdle = this.bogdle || {}
this.bogdle.selected = []
this.bogdle.solutionSet = {}
this.bogdle.solutionSize = 0
this.bogdle.config = {}
this.bogdle.config.gameState = 'IN_PROGRESS'
this.bogdle.config.lastCompletedTime = null
this.bogdle.config.lastPlayedTime = null

let LS_BOGDLE = 'bogdle-state'

this.bogdle.btnHelp = document.getElementById('button-help')
this.bogdle.btnStats = document.getElementById('button-stats')
this.bogdle.btnSettings = document.getElementById('button-settings')

this.bogdle.modal = document.getElementById('bogdle-modal')
this.bogdle.modalBody = document.getElementById('bogdle-modal-body')

this.bogdle.scoreGuessed = document.getElementById('score-guessed')
this.bogdle.scoreTotal = document.getElementById('score-total')
this.bogdle.guess = document.getElementById('guess')
this.bogdle.tiles = document.getElementsByClassName('tile')
this.bogdle.btnSubmit = document.getElementById('buttonSubmit')
this.bogdle.btnBackspace = document.getElementById('buttonBackspace')
this.bogdle.btnShowList = document.getElementById('buttonShowList')
this.bogdle.btnShuffle = document.getElementById('buttonShuffle')

function addEventListeners() {
  // tile interaction
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.addEventListener('click', (t) => {
      var tileStatus = t.target.dataset.state

      if (tileStatus == 'tbd') {
        // change tile status
        t.target.dataset.state = 'selected'

        // push another selected tile onto selected array
        this.bogdle.selected.push(t.target.dataset.pos)

        // add selected tile to guess
        this.bogdle.guess.innerHTML += t.target.innerHTML

        checkGuess()
      }
    })
  })

  // buttons to open modals
  this.bogdle.btnHelp.addEventListener('click', () => modalOpen('help'))
  this.bogdle.btnStats.addEventListener('click', () => modalOpen('stats'))
  this.bogdle.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // modal close button
  document.getElementById('bogdle-modal-close').onclick = function() {
    modalClose()
  }

  // submit word
  this.bogdle.btnSubmit.addEventListener('click', () => {
    submitWord(this.bogdle.guess.innerHTML)
  })

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (e) => {
    if (e.code == 'Enter') {
      submitWord(this.bogdle.guess.innerHTML)
    }
    if (e.code == 'Backspace' || e.code == 'Delete') {
      removeLastGuessLetter()
    }
  })

  // use backspace
  this.bogdle.btnBackspace.addEventListener('click', () => {
    removeLastGuessLetter()
  })

  this.bogdle.btnShowList.addEventListener('click', () => {
    modalOpen('show-list')
  })

  // console.log('added event listeners')
}

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
      this.bogdle.modalBody.innerHTML = Object.keys(this.bogdle.solutionSet).join(', ')
      break
    case 'help':
      this.bogdle.modalBody.innerHTML = `
        It's Boggle! Choose letters to make words. Each word is 3-9 letters long. Once you get them all, a helpful modal will pop up congratulating you. Isn't that grand?
      `
      break
    case 'stats':
      this.bogdle.modalBody.innerHTML = 'stats'
      break
    case 'settings':
      this.bogdle.modalBody.innerHTML = 'settings'
      break
    case 'win':
      this.bogdle.modalBody.innerHTML = `
        You Win!<br />
        ***********************************<br />
        ***********************************<br />
        ***********************************<br />
        ***********************************<br />
        ***********************************<br />
        ***********************************<br />
        ***********************************<br />
        ***********************************<br />
      `
      break
  }
}
function modalClose() {
  this.bogdle.modal.style.display = 'none';
}

function removeLastGuessLetter() {
  if (this.bogdle.config.gameState == 'IN_PROGRESS') {
    // remove last position from selected array
    if (this.bogdle.selected.length) {
      var last = this.bogdle.selected.pop()

      Array.from(this.bogdle.tiles).forEach(tile => {
        if (tile.dataset.pos == last) {
          tile.dataset.state = 'tbd'
        }
      })
    }

    // remove last letter of active guess
    if (this.bogdle.guess.innerHTML.length) {
      this.bogdle.guess.innerHTML = this.bogdle.guess.innerHTML.slice(0, this.bogdle.guess.innerHTML.length - 1)

      checkGuess()
    }
  }
}

function checkGuess() {
  // reset classes
  this.bogdle.guess.classList.remove('valid', 'first-guess', 'not-first-guess')

  // player entered valid word length
  if (this.bogdle.guess.innerHTML.length > 2) {
    var key = this.bogdle.guess.innerHTML

    // player guessed a valid word
    if (key in this.bogdle.solutionSet) {
      this.bogdle.guess.classList.toggle('valid')

      // and it's the first time
      if (!this.bogdle.solutionSet[key]) {
        this.bogdle.guess.classList.add('first-guess')
      } else {
        this.bogdle.guess.classList.add('not-first-guess')
      }
    } else { // player guessed an invalid word (not on list)

    }
  } else { // player guessed an invalid word (not long enough)

  }
}

function submitWord(word) {
  if (this.bogdle.config.gameState == 'IN_PROGRESS') {
    if (word.length > 2) {
      if (typeof this.bogdle.solutionSet[word] != undefined) {
        if (this.bogdle.solutionSet[word] != 1) {
          this.bogdle.solutionSet[word] = 1

          this.bogdle.config.lastPlayedTime = new Date().getTime()
          saveProgress()

          increaseScore()
          resetInput()

          // check win state
          checkWinState()
        } else {
          modalOpen('repeated-word', true)
        }
      } else {
        modalOpen('invalid-word', true)
      }
    } else {
      modalOpen('invalid-length', true)
    }
  }
}

function increaseScore() {
  // increase score
  var curGuessed = parseInt(this.bogdle.scoreGuessed.innerHTML)
  var newAmt = curGuessed += 1
  this.bogdle.scoreGuessed.innerHTML = newAmt.toString()
}

function resetInput() {
  // reset tiles
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
  // reset guess
  this.bogdle.guess.innerHTML = ''
  this.bogdle.guess.classList.remove('valid')
}

function setScore() {
  // console.log('setting score...')

  document.getElementById('score-guessed').innerHTML = getGuessedWords().length.toString()
  document.getElementById('score-total').innerHTML = this.bogdle.solutionSize

  var scoreString = `${document.getElementById('score-guessed').innerHTML} of ${document.getElementById('score-total').innerHTML}`

  // console.log('!score set!', scoreString)
}

function getGuessedWords() {
  return Object.keys(this.bogdle.solutionSet).filter(k => this.bogdle.solutionSet[k])
}

function saveProgress() {
  // console.log('saving localStorage progress...')

  var bogdleStateObj = {
    'gameState': this.bogdle.config.gameState,
    'guessedWords': getGuessedWords(),
    'lastCompletedTime': this.bogdle.config.lastCompletedTime,
    'lastPlayedTime': this.bogdle.config.lastPlayedTime
  }

  try {
    localStorage.setItem(LS_BOGDLE, JSON.stringify(bogdleStateObj))

    // console.log('!localStorage progress saved!', localStorage.getItem(LS_BOGDLE))
  } catch {
    console.error('error: localStorage could not be set')
  }
}

function loadProgress() {
  // console.log('loading progress...')

  if (localStorage.getItem(LS_BOGDLE)) {
    // console.log('localStorage key found and loading...')

    var lsConfig = JSON.parse(localStorage.getItem(LS_BOGDLE))

    // check off any pre-guessed words
    lsConfig.guessedWords.forEach(word => {
      this.bogdle.solutionSet[word] = 1
    })

    if (lsConfig.lastCompletedTime != null) {
      this.bogdle.config.lastCompletedTime = lsConfig.lastCompletedTime
    }
    if (lsConfig.lastPlayedTime != null) {
      this.bogdle.config.lastPlayedTime = lsConfig.lastPlayedTime
    }

    // console.log('!localStoragekey loaded!', localStorage.getItem(LS_BOGDLE))
  } else {
    // console.log('no localStorage key found')
    saveProgress()
  }

  // console.log('!progress loaded!', JSON.stringify(this.bogdle.solutionSet))

  setScore()

  checkWinState()
}

function loadSolutionSet() {
  // console.log('loading solution set...')

  fetch('./assets/json/test-solution-set.json')
    .then((response) => {
      // console.log('loadSolutionSet() got json')
      return response.json()
    }).then((data) => {
      this.bogdle.solutionSet = data
      this.bogdle.solutionSize = Object.keys(this.bogdle.solutionSet).length

      // console.log('!solution set loaded!', this.bogdle.solutionSet)

      loadProgress()
    }).catch((err) => {
      // console.error('error: loaded solution NOT set', err)
    })
}

function checkWinState() {
  // console.log('checking for win state...')

  if (Object.values(this.bogdle.solutionSet).every((val) => val == 1)) {
    // console.log('checkWinState(): game finished')

    // display modal win thingy
    modalOpen('win')

    // set config stuff
    this.bogdle.config.gameState = 'GAME_OVER'
    if (this.bogdle.config.lastCompletedTime == null) {
      this.bogdle.config.lastCompletedTime = new Date().getTime()
    }

    // disable inputs (until future daily re-enabling)
    disableGame()
  } else {
    // console.log('checkWinState(): game still in progress')
  }

  // save to localStorage
  saveProgress()
}

function disableGame() {
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}

function init() {
  // console.log('init()')

  addEventListeners()

  // gets solution set via fetch(); if success, load any LS progress and set score display
  loadSolutionSet()
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == this.bogdle.modal) {
    this.bogdle.modal.style.display = 'none';
  }
}

init()