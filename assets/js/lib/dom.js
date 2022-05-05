this.bogdle = this.bogdle || {}

// DOM
this.bogdle.dom = {}
// DOM > interactive elements
this.bogdle.dom.interactive = {
  "btnHelp": document.getElementById('button-help'),
  "btnStats": document.getElementById('button-stats'),
  "btnSettings": document.getElementById('button-settings'),
  "btnSubmit": document.getElementById('button-submit'),
  "btnBackspace": document.getElementById('button-backspace'),
  "btnClearGuess": document.getElementById('button-clear-guess'),
  "btnShuffle": document.getElementById('button-shuffle'),
  "btnShowProgress": document.getElementById('button-show-progress'),
  "btnGuessLookup": document.getElementById('button-guess-lookup'),
  "btnHint": document.getElementById('button-hint'),
  "btnHintReset": document.getElementById('button-hint-reset'),
  "tiles": document.getElementsByClassName('tile')
}
// DOM > interactive elements (debug)
this.bogdle.dom.interactive.debug = {
  "all": document.getElementById('debug-buttons'),
  "btnCreateNew": document.getElementById('button-create-new'),
  "btnShowList": document.getElementById('button-show-list'),
  "btnResetProgress": document.getElementById('button-reset-progress'),
  "btnShowConfig": document.getElementById('button-show-config')
}
// DOM > status elements
this.bogdle.dom.status = {}
this.bogdle.dom.status.guess = document.getElementById('guess')
this.bogdle.dom.status.score = document.getElementById('score-container')
this.bogdle.dom.status.scoreGuessed = document.getElementById('score-guessed')
this.bogdle.dom.status.scoreGuessedOf = document.getElementById('score-guessed-of')
this.bogdle.dom.status.scoreTotal = document.getElementById('score-total')
this.bogdle.dom.status.scoreTotalWords = document.getElementById('score-total-words')