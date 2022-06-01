// DOM
Bogdle.dom = {}
// DOM > interactive elements
Bogdle.dom.interactive = {
  "btnNav": document.getElementById('button-nav'),
  "btnNavClose": document.getElementById('button-nav-close'),
  "btnHelp": document.getElementById('button-help'),
  "btnStats": document.getElementById('button-stats'),
  "btnSettings": document.getElementById('button-settings'),
  "difficultyContainer": document.getElementById('difficulty-container'),
  "difficultyContainerLinks": document.querySelectorAll('#difficulty-container a'),
  "gameModeDailyLink": document.getElementById('gamemode-0'),
  "gameModeFreeLink": document.getElementById('gamemode-1'),
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
Bogdle.dom.interactive.debug = {
  "all": document.getElementById('debug-buttons'),
  "btnCreateNew": document.getElementById('button-create-new'),
  "btnShowList": document.getElementById('button-show-solution'),
  "btnResetProgress": document.getElementById('button-reset-progress'),
  "btnShowConfig": document.getElementById('button-show-config'),
  "btnShowState": document.getElementById('button-show-state')
}
// DOM > status elements
Bogdle.dom.status = {
  "navOverlay": document.getElementById('nav-overlay'),
  "navContent": document.getElementById('nav-content'),
  "guess": document.getElementById('guess'),
  "score": document.getElementById('score-container'),
  "scoreGuessed": document.getElementById('score-guessed'),
  "scoreGuessedOf": document.getElementById('score-guessed-of'),
  "scoreTotal": document.getElementById('score-total'),
  "scoreTotalWords": document.getElementById('score-total-words'),
}
