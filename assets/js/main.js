this.bogdle = this.bogdle || {}
this.bogdle.selected = []
this.bogdle.solutionSet = {
  'eat': 0,
  'hat': 0,
  'wet': 0
}
this.bogdle.solutionSize = Object.keys(this.bogdle.solutionSet).length
this.bogdle.gameState = "IN_PROGRESS"

let LS_BOGDLE = 'bogdle-state'

this.bogdle.btnHelp = document.getElementById('button-help')
this.bogdle.btnStats = document.getElementById('button-stats')
this.bogdle.btnSettings = document.getElementById('button-settings')

this.bogdle.modal = document.getElementById('bogdle-modal')
this.bogdle.modalBody = document.getElementById('bogdle-modal-body')

this.bogdle.scoreGuessed = document.getElementById('score-guessed')
this.bogdle.scoreTotal = document.getElementById('score-total')
this.bogdle.guess = document.getElementById('guess')
this.bogdle.guessIsValid = false
this.bogdle.tiles = document.getElementsByClassName('tile')
this.bogdle.btnSubmit = document.getElementById('buttonSubmit')
this.bogdle.btnBackspace = document.getElementById('buttonBackspace')
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
}

// modals
function modalOpen(type) {
  this.bogdle.modal.style.display = "flex";

  switch(type) {
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
      this.bogdle.modalBody.innerHTML = 'You Win!'
      break
  }
}

function modalClose() {
  this.bogdle.modal.style.display = "none";
}

function removeLastGuessLetter() {
  if (this.bogdle.gameState == "IN_PROGRESS") {
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

  // player entered at least one letter
  if (this.bogdle.guess.innerHTML.length > 0) {
    this.bogdle.btnBackspace.removeAttribute('disabled')
  } else {
    this.bogdle.btnBackspace.setAttribute('disabled', '')
  }

  // player entered valid word length
  if (this.bogdle.guess.innerHTML.length > 2) {
    var key = this.bogdle.guess.innerHTML

    // player guessed a valid word
    if (key in this.bogdle.solutionSet) {
      this.bogdle.guessIsValid = true
      this.bogdle.guess.classList.toggle('valid')
      this.bogdle.btnSubmit.removeAttribute('disabled')

      // and it's the first time
      if (!this.bogdle.solutionSet[key]) {
        this.bogdle.guess.classList.add('first-guess')
      } else {
        this.bogdle.guess.classList.add('not-first-guess')
        disableSubmit()
      }
    } else { // player guessed an invalid word (not on list)
      this.bogdle.guessIsValid = false
      
      disableSubmit()
    }
  } else { // player guessed an invalid word (not long enough)
    this.bogdle.guessIsValid = false

    disableSubmit()
  }
}

function submitWord(word) {
  if (this.bogdle.gameState == "IN_PROGRESS") {
    if (word.length > 2) {
      if (this.bogdle.guessIsValid && !this.bogdle.solutionSet[word]) {
        this.bogdle.solutionSet[word] = 1
        
        increaseScore()
        resetInput()
        saveProgress()

        // check win state
        checkWinState()
      } else {
        alert('Invalid word')
      }
    } else {
      alert('Not enough letters')
    }
  }
}

function increaseScore() {
  // increase score
  var curGuessed = parseInt(this.bogdle.scoreGuessed.innerHTML)
  var newAmt = curGuessed += 1
  this.bogdle.scoreGuessed.innerHTML = newAmt.toString()
}

function disableSubmit() {
  if (!this.bogdle.btnSubmit.hasAttribute('disabled')) {
    this.bogdle.btnSubmit.setAttribute('disabled', '')
  }
}

function resetInput() {
  // reset tiles
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
  // re-disable submit
  disableSubmit()
  // reset guess
  this.bogdle.guess.innerHTML = ''
  this.bogdle.guess.classList.remove('valid')
}

function setScore() {
  document.getElementById('score-guessed').innerHTML = getGuessedWords().length.toString()
  document.getElementById('score-total').innerHTML = this.bogdle.solutionSize
}

function getGuessedWords() {
  return Object.keys(this.bogdle.solutionSet).filter(k => this.bogdle.solutionSet[k])
}

function saveProgress() {
  var bogdleStateObj = {
    'gameState': this.bogdle.gameState,
    'guessedWords': getGuessedWords(),
    'lastCompletedTime': this.bogdle.lastCompletedTime,
    'lastPlayedTime': new Date().getTime()
  }

  localStorage.setItem(LS_BOGDLE, JSON.stringify(bogdleStateObj))
}

function loadProgress() {
  if (localStorage.getItem(LS_BOGDLE)) {
    var ls = JSON.parse(localStorage.getItem(LS_BOGDLE))
    ls.guessedWords.forEach(word => {
      this.bogdle.solutionSet[word] = 1
    })
    checkWinState()
  }
}

function checkWinState() {
  if (Object.values(this.bogdle.solutionSet).every((val) => val)) {
    modalOpen('win')
    this.bogdle.lastCompletedTime = new Date().getTime
    this.bogdle.gameState = 'GAME_OVER'
    saveProgress()
    disableGame()
  }
}

function disableGame() {
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })

  this.bogdle.btnBackspace.setAttribute('disabled', '')
}

function init() {
  addEventListeners()
  loadProgress()

  setScore()
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == this.bogdle.modal) {
    this.bogdle.modal.style.display = "none";
  }
}

init()