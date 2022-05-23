// settings: saved in LOCAL STORAGE
Bogdle.settings = {
  "darkMode": false,
  "gameMode": 'free',
  "noisy": false
}

// state: saved between sessions LOCAL STORAGE
Bogdle.state = {}
// state->daily
Bogdle.state.daily = {}
// state->free
Bogdle.state.free = {}

// config: only saved while game is loaded
Bogdle.config = {}
// config->daily
Bogdle.config.daily = {}
Bogdle.config.daily.hintWord = null
Bogdle.config.daily.solutionSet = EMPTY_OBJ_SET
Bogdle.config.daily.tempWord = []
Bogdle.config.daily.tempWordCounter = 0
// config->free
Bogdle.config.free = {}
Bogdle.config.free.hintWord = null
Bogdle.config.free.seedWord = null
Bogdle.config.free.solutionSet = EMPTY_OBJ_SET
Bogdle.config.free.tempWord = []
Bogdle.config.free.tempWordCounter = 0

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
async function modalOpen(type) {
  switch(type) {
    case 'start':
    case 'help':
      this.myModal = new Modal('perm', 'How to Play Bogdle',
        `
          <p>Find all the words in the jumble of letters! Each word is at least 3 letters and as long as the difficulty (KID: 3, EASY: 5, MEDIUM: 7, NORMAL: 9). Letters don't need to be adjacent (unlike actual Boggle).</p>

          <ul class="help">
            <li><button class="help"><i class="fa-solid fa-check"></i></button> Submit word</li>
            <li><button class="help"><i class="fa-solid fa-backspace"></i></button> Delete last letter in guess</li>
            <li><button class="help"><i class="fa-solid fa-xmark"></i></button> Clear entire guess</li>
            <li><button class="help"><i class="fa-solid fa-shuffle"></i></button> Shuffle the tiles</li>
            <li><button class="help"><i class="fa-solid fa-list-check"></i></button> Show current progress</li>
            <li><button class="help"><i class="fa-solid fa-book"></i></button> Lookup valid word in dictionary</li>
            <li><button class="help"><i class="fa-solid fa-circle-plus"></i></button> Create new puzzle</li>
          </ul>

          <p>One mode is available now: <strong>Free Play</strong>. Play as many puzzles as you'd like. Tap on <button class="help"><i class="fa-solid fa-circle-plus"></i></button> to load a new one.</p>

          <hr />

          <p><em>Coming soon</em>: <strong>Daily</strong>. This will be like Wordle (and its variants), offering a new puzzle each day.</p>

          <hr />

          <p><strong>Programming/Design</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>. <strong>Sound effects</strong>: Fliss.</p>
        `,
        null,
        null
      )
      break

    case 'dictionary':
      var word = Bogdle.dom.status.guess.innerHTML

      try {
        const response = await fetch(`${DEFINE_LOOKUP_URL}/${word}`)
        const responseJson = await response.json()

        if (responseJson) {
          const entry = responseJson[0]

          // console.log('entry', entry)

          this.myModal = new Modal('perm', 'Dictionary (via Free Dictionary API)',
            `
              <div class="dictionary">
                <strong>${entry.word}</strong> ${entry.phonetic}
                <hr />
                <em>${entry.meanings[0].partOfSpeech}</em>: ${entry.meanings[0].definitions[0].definition}
              </div>
            `,
            null,
            null,
            false
          )
        }
      } catch(e) {
        console.error('could not lookup word', e)
      }
      break

    case 'stats':
    case 'win':
      this.myModal = new Modal('perm', 'Statistics',
        `
          <div class="container">

            <div class="statistic-header">Daily</div>
            <div class="statistics">
              <div class="statistic-container">
                <div class="statistic">${Bogdle.state.daily.statistics.gamesPlayed}</div>
                <div class="statistic-label">Games Played</div>
              </div>
              <div class="statistic-container">
                <div class="statistic">${Bogdle.state.daily.statistics.wordsFound}</div>
                <div class="statistic-label">Words Found</div>
              </div>
            </div>

            <div class="statistic-header">Free Play</div>
            <div class="statistics">
              <div class="statistic-container">
                <div class="statistic">${Bogdle.state.free.statistics.gamesPlayed}</div>
                <div class="statistic-label">Games Played</div>
              </div>
              <div class="statistic-container">
                <div class="statistic">${Bogdle.state.free.statistics.wordsFound}</div>
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
            <!-- dark mode -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Dark Mode</div>
                <div class="description">Change colors to better suit low light</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-dark-mode" data-status="" class="switch" onclick="_changeSetting('darkMode')">
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
                  <div id="button-setting-noisy" data-status="" class="switch" onclick="_changeSetting('noisy')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        null,
        null
      )


      _loadGlobalSettings()

      break

    case 'show-progress':
      this.myModal = new Modal('perm', 'Game Progress',
        _displayGameProgress(),
        null,
        null
      )
      break

    case 'show-solution':
      this.myModal = new Modal('perm-debug', 'Master Word List',
        _displayGameSolution(),
        null,
        null
      )
      break
    case 'show-config':
      this.myModal = new Modal('perm-debug', 'Game Config',
        _displayGameConfig(),
        null,
        null
      )
      break
    case 'show-state':
      this.myModal = new Modal('perm-debug', 'Game State',
        _displayGameState(),
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

// start the engine
Bogdle.init = async () => {
  // console.log('init started')

  // set env
  Bogdle.env = document.location.hostname == ENV_PROD_URL ? 'prod' : 'local'

  // disable lookup
  Bogdle.dom.interactive.btnGuessLookup.disabled = true

  // if local dev, show debug stuff
  if (Bogdle.env == 'local') {
    _initDebug()

    document.title = '(LH) ' + document.title
  }

  _initAudio()

  // attach event listeners to DOM elements
  _attachEventListeners()

  // load localStorage game state
  _loadGameState()

  // console.log('!bogdle has been initialized!')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// load state/statistics from LS -> code model
async function _loadGameState() {
  var lsStateDaily = JSON.parse(localStorage.getItem(LS_STATE_DAILY_KEY))

  // load daily game state
  if (lsStateDaily) {
    console.log('localStorage DAILY state key found and loading...', lsStateDaily)

    const gameMode = 'daily'

    Bogdle.state[gameMode].gameState = lsStateDaily.gameState
    Bogdle.state[gameMode].guessedWords = lsStateDaily.guessedWords
    Bogdle.state[gameMode].lastCompletedTime = lsStateDaily.lastCompletedTime
    Bogdle.state[gameMode].lastPlayedTime = lsStateDaily.lastPlayedTime
    Bogdle.state[gameMode].statistics = {
      "gamesPlayed": lsStateDaily.statistics.gamesPlayed,
      "wordsFound": lsStateDaily.statistics.wordsFound
    }

    // no lastPlayedTime?
    if (Bogdle.state[gameMode].lastPlayedTime == null) {
      modalOpen('help')
    }

    // console.log('!localStorage DAILY key loaded!', Bogdle.state[gameMode])
  } else {
    console.log('no localStorage DAILY key found; defaults being set')

    const gameMode = 'daily'

    Bogdle.state[gameMode].gameState = 'IN_PROGRESS'
    Bogdle.state[gameMode].guessedWords = []
    Bogdle.state[gameMode].lastCompletedTime = null
    Bogdle.state[gameMode].lastPlayedTime = null
    Bogdle.state[gameMode].statistics = {
      "gamesPlayed": 0,
      "wordsFound": 0
    }
  }

  var lsStateFree = JSON.parse(localStorage.getItem(LS_STATE_FREE_KEY))

  // load free game state
  if (lsStateFree) {
    console.log('localStorage FREE state key found and loading...', lsStateFree)

    const gameMode = 'free'

    Bogdle.state[gameMode].difficulty = lsStateFree.difficulty
    Bogdle.state[gameMode].gameState = lsStateFree.gameState
    Bogdle.state[gameMode].guessedWords = lsStateFree.guessedWords
    Bogdle.state[gameMode].lastCompletedTime = lsStateFree.lastCompletedTime
    Bogdle.state[gameMode].lastPlayedTime = lsStateFree.lastPlayedTime
    Bogdle.state[gameMode].statistics = {
      "gamesPlayed": lsStateFree.statistics.gamesPlayed,
      "wordsFound": lsStateFree.statistics.gamesPlayed
    }

    await _loadExistingSolutionSet(Bogdle.settings.gameMode)

    // console.log('!localStorage FREE key loaded!', Bogdle.state[gameMode])
  } else {
    console.log('no localStorage FREE key found; defaults being set')

    const gameMode = 'free'

    Bogdle.state[gameMode].difficulty = 'normal'
    Bogdle.state[gameMode].gameState = 'IN_PROGRESS'
    Bogdle.state[gameMode].guessedWords = []
    Bogdle.state[gameMode].lastCompletedTime = null
    Bogdle.state[gameMode].lastPlayedTime = null
    Bogdle.state[gameMode].statistics = {
      "gamesPlayed": 0,
      "wordsFound": 0
    }

    await _createNewSolutionSet(Bogdle.settings.gameMode)
  }

  // load global (gear icon) settings
  _loadGlobalSettings()

  _saveGameState()

  if (!lsStateDaily && !lsStateFree) {
    modalOpen('start')
  }

  // console.log('!daily progress loaded!', Bogdle.config.daily.solutionSet)
  // console.log('!free progress loaded!', Bogdle.config.free.solutionSet)
}

// save game state/settings from code model -> LS
function _saveGameState() {
  // console.log('saving game state and global settings to localStorage...')

  // save daily game state
  try {
    localStorage.setItem(LS_STATE_DAILY_KEY, JSON.stringify(Bogdle.state.daily))

    // console.log('!localStorage DAILY state saved!', JSON.parse(localStorage.getItem(LS_STATE_DAILY_KEY)))
  } catch(error) {
    console.error('localStorage DAILY state save failed', error)
  }

  // save free game state
  try {
    localStorage.setItem(LS_STATE_FREE_KEY, JSON.stringify(Bogdle.state.free))

    // console.log('!localStorage FREE state saved!', JSON.parse(localStorage.getItem(LS_STATE_FREE_KEY)))
  } catch(error) {
    console.error('localStorage FREE state save failed', error)
  }

  // save global game settings
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(Bogdle.settings))

    // console.log('!localStorage global settings saved!', JSON.parse(localStorage.getItem(LS_SETTINGS_KEY)))
  } catch(error) {
    console.error('localStorage global settings save failed', error)
  }
}

// save a setting (gear icon) to localStorage
function _saveGlobalSetting(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  var settings = JSON.parse(localStorage.getItem(LS_SETTINGS_KEY))

  // console.log('current settings', settings)

  // set temp obj that will go to LS
  settings[setting] = value
  // set internal code model
  Bogdle.settings[setting] = value

  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings))

  // console.log('!global setting saved!', Bogdle.settings)
}
// load settings (gear icon) from localStorage
function _loadGlobalSettings() {
  // console.log('loading global settings from LS...')

  // STATE->GAMEMODE
  if (Bogdle.settings.gameMode == 'free') {
    Bogdle.dom.interactive.difficultyContainer.classList.add('show')
  }

  // STATE->FREE->DIFFICULTY
  if (localStorage.getItem(LS_STATE_FREE_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_FREE_KEY))

    if (lsConfig) {
      if (lsConfig.difficulty) {
        Bogdle.dom.interactive.difficultyContainerLinks.forEach(link => link.dataset.active = false)
        var setting = document.getElementById(`diff-${lsConfig.difficulty}`)

        if (setting) {
          setting.dataset.active = true
        }
      }
    }
  }

  // SETTINGS
  if (localStorage.getItem(LS_SETTINGS_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_SETTINGS_KEY))

    if (lsConfig) {
      if (lsConfig.darkMode) {
        Bogdle.settings.darkMode = lsConfig.darkMode

        document.body.classList.add('dark-mode')

        var setting = document.getElementById('button-setting-dark-mode')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsConfig.noisy) {
        Bogdle.settings.noisy = lsConfig.noisy

        var setting = document.getElementById('button-setting-noisy')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }
  } else {
    Bogdle.settings.darkMode = false
    Bogdle.settings.gameMode = 'free'
    Bogdle.settings.noisy = false
  }

  // console.log('loaded global settings from LS!', Bogdle.settings)
}

// add debug stuff if local
function _initDebug() {
  // if debug buttons are in template
  if (Bogdle.dom.interactive.debug.all) {
    // show debug buttons
    Bogdle.dom.interactive.debug.all.style.display = 'flex'
    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll('button.icon').forEach((btn) => {
      btn.style.fontSize = '16px'
    })
  }

  var qd = {};
  if (location.search) location.search.substr(1).split("&").forEach(function(item) {
    var s = item.split("="),
        k = s[0],
        v = s[1] && decodeURIComponent(s[1]); //  null-coalescing / short-circuit
    //(k in qd) ? qd[k].push(v) : qd[k] = [v]
    (qd[k] = qd[k] || []).push(v) // null-coalescing / short-circuit
  })

  if (qd.debugCSS && qd.debugCSS == 1) {
    var debugStyles = document.createElement('link')
    debugStyles.rel = 'stylesheet'
    debugStyles.href = './assets/css/debug.css'
    document.head.appendChild(debugStyles)
  }
}

// add audio files to CacheStorage
async function _initAudio() {
  caches.open(CACHE_AUDIO_KEY).then(cache => {
    cache.addAll([
      '/assets/audio/doo-dah-doo.wav',
      '/assets/audio/haaahs1.wav',
      '/assets/audio/haaahs2.wav',
      '/assets/audio/haaahs3.wav',
      '/assets/audio/tile_click.wav',
      '/assets/audio/tile_delete.wav'
    ]);
  })
}

// create new solution set, which resets progress
async function _createNewSolutionSet(gameMode, newWord = null) {
  // console.log('creating a new solution set...')

  // default config and stats (both save to, and are loaded from, localStorage)
  if (!Bogdle.state[gameMode].difficulty) {
    Bogdle.state[gameMode].difficulty = 'normal'
  }

  Bogdle.state[gameMode].gameState = 'IN_PROGRESS'
  Bogdle.state[gameMode].guessedWords = []
  Bogdle.state[gameMode].lastCompletedTime = null
  Bogdle.state[gameMode].lastPlayedTime = null

  // dictionary to pull from
  Bogdle.config[gameMode].dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[Bogdle.state[gameMode].difficulty]]}/words_3-${__getMaxWordLength()}.json`

  Bogdle.config[gameMode].letters = []

  // grab appropriate EMPTY_OBJ_SET
  switch (DIFF_TO_LENGTH[parseInt(Bogdle.difficulty)]) {
    case 3: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_3; break
    case 5: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_5; break
    case 7: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_7; break
    case 9:
    default:
      Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET; break
  }

  // construct start words file
  Bogdle.config[gameMode].startWordsFile = './assets/json/'
  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  Bogdle.config[gameMode].startWordsFile += WORD_SOURCES[DIFFICULTY[Bogdle.state[gameMode].difficulty]]
  Bogdle.config[gameMode].startWordsFile += `/words_9-9.json`

  // console.log('Bogdle.config[gameMode].startWordsFiles', Bogdle.config[gameMode].startWordsFile)

  // keep track of which tiles have been selected
  Bogdle.config[gameMode].tilesSelected = []

  // new game with static start word
  if (newWord) {
    // console.log(`new solution requested with static word '${newWord}'...`)
  } // new game with random start word
  else {
    try {
      newWord = await __getNewStartWord()

      // console.log(`new solution requested with random word '${newWord}'...`)
    } catch (err) {
      console.error('could not get new start word', err)
    }
  }

  Bogdle.config[gameMode].seedWord = newWord

  // create new game
  try {
    const findle = await createFindle(
      Bogdle.config[gameMode].seedWord,
      Bogdle.config[gameMode].dictionary,
      Bogdle.state[gameMode]
    )

    if (findle) {
      /********************************************************************
      * set new Bogdle/Findle solution                                    *
      * -------------------                                               *
      * load object of arrays (e.g. {"3":['aaa'],"4":['aaaa']})           *
      * turn into object of objects (e.g. {"3":{'aaa':0},"4":{'aaaa':0}}) *
      *********************************************************************/

      // get a range of object keys from 3..__getMaxWordLength()
      var categories = Array.from({length: __getMaxWordLength() - 2}, (x, i) => (i + 3).toString());

      // zero them all out because setting it to the EMPTY_OBJ_SET does not work :'(
      categories.forEach(category => {
        Bogdle.config[gameMode].solutionSet[category] = {}
      })

      // create bogdle's solution set
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (!Bogdle.config[gameMode].solutionSet[key.toString()][word]) {
            Bogdle.config[gameMode].solutionSet[key.toString()][word] = {}
          }

          Bogdle.config[gameMode].solutionSet[key.toString()][word] = 0
        })
      })

      // console.log('test: Bogdle.config[gameMode].solutionSet', Bogdle.config[gameMode].solutionSet)

      // set tile letter tracking
      Bogdle.config[gameMode].letters = newWord.split('')

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
async function _loadExistingSolutionSet(gameMode, newWord = null, isNewDiff = false) {
  // console.log('loading existing solution set...')

  // dictionary to pull from
  Bogdle.config[gameMode].dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[Bogdle.state[gameMode].difficulty]]}/words_3-${__getMaxWordLength()}.json`

  Bogdle.config[gameMode].letters = []

  switch (__getMaxWordLength()) {
    case 3: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_3; break
    case 5: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_5; break
    case 7: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_7; break
    case 9:
    default:
      Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET; break
  }

  Bogdle.config[gameMode].startWordsFile = './assets/json/'
  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  Bogdle.config[gameMode].startWordsFile += WORD_SOURCES[DIFFICULTY[Bogdle.state[gameMode].difficulty]]
  Bogdle.config[gameMode].startWordsFile += `/words_9-9.json`

  // console.log('Bogdle.config[gameMode].startWordsFiles', Bogdle.config[gameMode].startWordsFile)

  // keep track of which tiles have been selected
  Bogdle.config[gameMode].tilesSelected = []

  // new game with static start word
  if (newWord) {
    // console.log(`existing solution requested with static word '${newWord}'...`)
  } // new game with random start word
  else {
    try {
      newWord = await __getNewStartWord()

      // console.log(`existing solution requested with random word '${newWord}'...`)
    } catch (err) {
      console.error('could not get new start word', err)
    }
  }

  Bogdle.config[gameMode].seedWord = newWord

  // load existing game
  try {
    const findle = await createFindle(
      Bogdle.config[gameMode].seedWord,
      Bogdle.config[gameMode].dictionary,
      Bogdle.state[gameMode]
    )

    if (findle) {
      /********************************************************************
      * set new Bogdle/Findle solution                                    *
      * -------------------                                               *
      * load object of arrays (e.g. {"3":['aaa'],"4":['aaaa']})           *
      * turn into object of objects (e.g. {"3":{'aaa':0},"4":{'aaaa':0}}) *
      *********************************************************************/

      // get a range of object keys from 3..__getMaxWordLength()
      var categories = Array.from({length: __getMaxWordLength() - 2}, (x, i) => (i + 3).toString());

      // zero them all out because setting it to the EMPTY_OBJ_SET does not work :'(
      categories.forEach(category => {
        Bogdle.config[gameMode].solutionSet[category] = {}
      })

      // re-create bogdle's solution set
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (!Bogdle.config[gameMode].solutionSet[key.toString()][word]) {
            Bogdle.config[gameMode].solutionSet[key.toString()][word] = {}
          }

          Bogdle.config[gameMode].solutionSet[key.toString()][word] = 0
        })
      })

      // set tile letter tracking
      Bogdle.config[gameMode].letters = newWord.split('')

      // if just changing difficulty, clear guessedWords
      if (isNewDiff) {
        Bogdle.state[gameMode].guessedWords = []
        _setScore(0)
        _saveGameState()
      } // else check for pre-guessed words
      else {
        var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_DAILY_KEY))

        Bogdle.state[gameMode].guessedWords = []

        // console.log('checking off pre-guessed words...', lsConfig)

        if (lsConfig.guessedWords && lsConfig.guessedWords.length) {
          // console.log('found some pre-guessed words, so adding to code')

          lsConfig.guessedWords.forEach(word => {
            Bogdle.state[gameMode].guessedWords.push(word)
            Bogdle.config[gameMode].solutionSet[word.length][word] = 1
          })

          // console.log('loaded existing solutionSet and checked off pre-guessed words', Bogdle.config[gameMode].solutionSet)

          // set score to existing number of guessedWords
          _setScore(Bogdle.state[gameMode].guessedWords.length)
        } else {
          // set score back to 0
          // console.log('found no pre-guessed words')
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

// ask to create new free gamemode puzzle
async function _confirmFreeCreateNew() {
  this.myConfirm = new Modal('confirm', 'Create New Puzzle?',
    'Are you <strong>sure</strong> you want to create a new puzzle?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    var confirmed = await myConfirm.question()

    if (confirmed) {
      _resetFreeProgress()
      _createNewSolutionSet(Bogdle.settings.gameMode)
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// reset config and LS for free play
async function _resetFreeProgress() {
  // console.log('resetting free play progress...')

  // set config to defaults
  Bogdle.state[__getMode()] = {
    "difficulty": Bogdle.state[__getMode()].difficulty,
    "gameState": "IN_PROGRESS",
    "guessedWords": [],
    "lastCompletedTime": null,
    "lastPlayedTime": null,
    "statistics": {
      "gamesPlayed": 0,
      "wordsFound": 0
    }
  }

  Bogdle.config[__getMode()].dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[Bogdle.state[__getMode()].difficulty]]}/words_3-${__getMaxWordLength()}.json`

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

// change a setting (gear icon or difficulty) value
async function _changeSetting(setting, value, event) {
  switch (setting) {
    case 'gameMode':
      var target = value.target

      console.log('event', event)

      if (value == 'daily') {
        try {
          const response = await fetch('scripts/daily.php')
          const responseWord = await response.text()

          if (responseWord) {
            console.log(`Word for ${_todaysDate()}:`, responseWord)
          } else {
            console.error('daily word bork', responseWord)
          }
        } catch (e) {
          console.error('could not get daily word', e)
        }
      }

      break
    case 'difficulty':
      var target = value.target
      var gameMode = 'free'
      var oldDiff = Bogdle.state[gameMode].difficulty
      var newDiff = target.dataset.diffid

      // don't prompt unless new difficulty
      if (newDiff != oldDiff) {
        // make sure user wants to change difficulty, as it loses all progress
        var mySubConfirm = new Modal('confirm', 'Change Difficulty?',
          'Changing the difficulty will start a new puzzle, and the current one will be lost. Are you sure you want to do this?',
          'Yes, change the difficulty',
          'No, never mind'
        )

        try {
          // wait for modal confirmation
          var confirmed = await mySubConfirm.question()

          // if confirmed, set new difficulty and reset game
          if (confirmed) {
            // set internal code model
            Bogdle.state[gameMode].difficulty = newDiff

            // set dom status
            document.getElementById(`diff-${oldDiff}`).dataset.active = false
            document.getElementById(target.id).dataset.active = true

            _clearHint()

            // start a new game with newDiff (but using current seedWord)
            _loadExistingSolutionSet(Bogdle.config[gameMode].seedWord, true)
          }
          else {
            // document.querySelector(`#container-difficulty input[data-diffid="${oldDiff}"]`).checked = true
          }
        } catch (err) {
          console.error('difficulty change failed', err)
        }
      }

      break
    case 'darkMode':
      var st = document.getElementById('button-setting-dark-mode').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-dark-mode').dataset.status = 'true'
        document.body.classList.add('dark-mode')

        _saveGlobalSetting('darkMode', true)
      } else {
        document.getElementById('button-setting-dark-mode').dataset.status = 'false'
        document.body.classList.remove('dark-mode')

        _saveGlobalSetting('darkMode', false)
      }

      break
    case 'noisy':
      var st = document.getElementById('button-setting-noisy').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-noisy').dataset.status = 'true'

        _saveGlobalSetting('noisy', true)
      } else {
        document.getElementById('button-setting-noisy').dataset.status = 'false'

        _saveGlobalSetting('noisy', false)
      }

      break
  }
}

// submit a guess
function _submitWord(word) {
  // console.log('submitting word...', word)

  if (Bogdle.state[__getMode()].gameState == 'IN_PROGRESS') {
    if (word.length > 2) {
      if (typeof Bogdle.config[__getMode()].solutionSet[word.length][word] != 'undefined') {
        if (Bogdle.config[__getMode()].solutionSet[word.length][word] !== 1) {

          if (word.length == __getMaxWordLength()) {
            audioPlay(`doo-dah-doo`)
          } else {
            // choose haaahs[1-3] at random and play
            var num = Math.floor(Math.random() * 3) + 1
            audioPlay(`haaahs${num}`)
          }

          if (!Bogdle.state[__getMode()].guessedWords) {
            Bogdle.state[__getMode()].guessedWords = []
          }

          Bogdle.state[__getMode()].guessedWords.push(word)
          Bogdle.state[__getMode()].guessedWords.sort()
          Bogdle.state[__getMode()].lastPlayedTime = new Date().getTime()
          Bogdle.state[__getMode()].statistics.wordsFound += 1

          Bogdle.config[__getMode()].solutionSet[word.length][word] = 1

          Bogdle.dom.status.guess.classList.remove('first-guess')

          // do a dance
          animateCSS('#guess', 'tada')

          // clear hint if it's the same word
          if (word == Bogdle.config[__getMode()].hintWord) {
            _clearHint()
          }

          _saveGameState()

          _increaseScore()

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

// increase score
function _increaseScore() {
  // get current score as an integer
  var curGuessed = parseInt(Bogdle.dom.status.scoreGuessed.innerHTML)
  // increase and convert back to string
  Bogdle.dom.status.scoreGuessed.innerHTML = (curGuessed + 1).toString()
}
// set score
function _setScore(guessed = 0) {
  // console.log('setting score...')

  // set UI elements
  Bogdle.dom.status.scoreGuessed.innerHTML = guessed.toString()
  Bogdle.dom.status.scoreGuessedOf.innerHTML = ' of '
  Bogdle.dom.status.scoreTotal.innerHTML = __getSolutionSize().toString()
  Bogdle.dom.status.scoreTotalWords.innerHTML = ' words'

  // console.log('!score set!', `${Bogdle.dom.status.score.innerHTML}`)
}

// game state checking
function _checkGuess() {
  // reset classes
  Bogdle.dom.status.guess.classList.remove('valid', 'first-guess')
  Bogdle.dom.interactive.btnGuessLookup.disabled = true

  // player entered valid word length
  if (Bogdle.dom.status.guess.innerHTML.length > 2) {
    var word = Bogdle.dom.status.guess.innerHTML.trim()

    // player guessed a valid word
    Object.keys(Bogdle.config[__getMode()].solutionSet).forEach(key => {
      if (parseInt(key) <= __getMaxWordLength()) {
        if (Object.keys(Bogdle.config[__getMode()].solutionSet[key]).includes(word)) {
          Bogdle.dom.status.guess.classList.toggle('valid')
          Bogdle.dom.interactive.btnGuessLookup.disabled = false

          // and it's the first time
          if (!Bogdle.config[__getMode()].solutionSet[key][word]) {
            Bogdle.dom.status.guess.classList.add('first-guess')
            animateCSS('#guess', 'pulse')
          }
        } else {
          // player guessed an invalid word (not on list)
          Bogdle.dom.interactive.btnGuessLookup.disabled = true
        }
      }
    })
  } else {
    // player guessed an invalid word (not long enough)
  }
}
function _checkWinState() {
  // console.log('checking for win state...')

  if (Bogdle.config[__getMode()].solutionSet) {
    if (Object.values(Bogdle.config[__getMode()].solutionSet).every((val) => val == 1)) {
      // console.log('_checkWinState(): game won!', Bogdle.config[__getMode()].solutionSet)

      if (Bogdle.state[__getMode()].gameState == 'IN_PROGRESS') {
        Bogdle.state[__getMode()].statistics.gamesPlayed += 1
      }

      // display modal win thingy
      modalOpen('win')

      // set config stuff
      Bogdle.state[__getMode()].gameState = 'GAME_OVER'

      if (Bogdle.state[__getMode()].lastCompletedTime == null) {
        Bogdle.state[__getMode()].lastCompletedTime = new Date().getTime()
      }

      _saveGameState()

      // disable inputs (until future daily re-enabling)
      _disableTiles()

      return true
    } else {
      // console.log('_checkWinState(): game still in progress')
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
  Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}
// set all tiles back to 'tbd'
function _resetTiles() {
  Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
}
// randomize the order of tiles
function _shuffleTiles() {
  let letters = Bogdle.config[__getMode()].letters

  // shuffle order of letters
  var j, x, index;
  for (index = letters.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1));
    x = letters[index];
    letters[index] = letters[j];
    letters[j] = x;
  }

  // fill UI tiles with letters
  Array.from(Bogdle.dom.interactive.tiles).forEach((tile, i) => {
    tile.innerHTML = letters[i]
  })

  // make sure game is playable again
  _resetInput()
}

// blank out the current DOM guess div
function _resetGuess() {
  Bogdle.dom.status.guess.innerHTML = ''
  Bogdle.dom.status.guess.classList.remove('valid')
  Bogdle.dom.interactive.btnGuessLookup.disabled = true
}
// remove last letter in DOM guess div
function _removeLastLetter() {
  if (Bogdle.state[__getMode()].gameState == 'IN_PROGRESS') {
    // remove last position from selected array
    if (Bogdle.config[__getMode()].tilesSelected.length) {
      var last = Bogdle.config[__getMode()].tilesSelected.pop()

      Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
        if (tile.dataset.pos == last) {
          tile.dataset.state = 'tbd'
        }
      })
    }

    // remove last letter of active guess
    if (Bogdle.dom.status.guess.innerHTML.length) {
      Bogdle.dom.status.guess.innerHTML = Bogdle.dom.status.guess.innerHTML.slice(0, Bogdle.dom.status.guess.innerHTML.length - 1)

      audioPlay('tile_delete')

      _checkGuess()
    }
  }
}

// dynamically resize board depending on viewport
function _resizeBoard() {
  // console.log('--------------- resizing board ---------------')

  var boardContainer = document.querySelector('#board-container')

  // console.log('windowHeight', window.innerHeight)
  // console.log('docBodyScrollHeight', document.body.scrollHeight)
  // console.log('docDocElemClientHeight', document.documentElement.clientHeight)
  // console.log('docDocElemScrollHeight', document.documentElement.scrollHeight)

  var boardHeight = boardContainer.clientHeight + 20

  // console.log('boardHeight', boardHeight)

  var containerHeight = Math.min(Math.floor(boardHeight), 350)

  // console.log('containerHeight', containerHeight)

  var tileHeight = 2.5 * Math.floor(containerHeight / 3)

  // console.log('tileHeight', tileHeight)

  var board = document.querySelector('#board')
  board.style.width = `${containerHeight}px`
  board.style.height = `${tileHeight}px`

  // console.log(`resized to ${containerHeight}w x ${tileHeight}h`)
}

// user clicks a tile
function _onTileClick(tile) {
  const tileStatus = tile.target.dataset.state

  if (tileStatus == 'tbd') {
    animateCSS(`#${tile.target.id}`, 'pulse')

    // change tile status
    tile.target.dataset.state = 'selected'

    // push another selected tile onto selected array
    Bogdle.config[__getMode()].tilesSelected.push(tile.target.dataset.pos)

    // add selected tile to guess
    Bogdle.dom.status.guess.innerHTML += tile.target.innerHTML

    audioPlay('tile_click')

    // check guess for validity
    _checkGuess()
  }
}

// modal: show how many words have been guessed
function _displayGameProgress() {
  var gameMode = Bogdle.settings.gameMode
  var html = ''

  if (gameMode == 'free') {
    html += `<h6>Difficulty: ${Bogdle.state[gameMode].difficulty}</h6>`
  }

  html += '<ul>'

  // check each length category (max...3, etc.)
  // total up words guessed in each
  Object.keys(Bogdle.config[gameMode].solutionSet).reverse().forEach(category => {
    if (parseInt(category) <= __getMaxWordLength()) {
      html += `<li><span class="solution-category">${category}-LETTER</span>`

      var categoryEntries = Object.entries(Bogdle.config[gameMode].solutionSet[category])
      var categoryGuessed = categoryEntries
        .filter(entry => entry[1])

      categoryLength = Object.keys(Bogdle.config[gameMode].solutionSet[category])
        .length

      html += ` ${categoryGuessed.length} of ${categoryLength}`
      html += `<ul><li>`
      html += categoryGuessed.map(x => x[0].toUpperCase()).sort().join(', ')
      html += `</li></ul></li>`
    }
  })

  html += '</ul>'

  return html
}

// modal: debug: prettily display Bogdle.config
function _displayGameConfig() {
  let configs = Bogdle.config

  var html = ''

  html += `<h4>GLOBAL (ENV: ${Bogdle.env})</h4>`
  html += '<h4>----------------------------</h4>'

  html += '<dl>'

  Object.keys(configs).forEach(config => {
    html += `<h4>CONFIG: ${config}</h4>`

    Object.keys(configs[config]).sort().forEach(key => {

      if (
        (typeof configs[config][key] == 'object'
          && !Array.isArray(configs[config][key])
          && configs[config][key] != null
        )
      ) {
        html += `<dd><code>${key}: {</code><dl>`

        // skip object-within-object key
        if (key == 'solutionSet') {
          html += '</dl><code>}</code></dd>'
        } else {
          Object.keys(configs[config][key]).forEach(k => {
            var label = k
            var value = configs[config][key][k]

            if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
              value = __getFormattedDate(new Date(value))
            }

            if (Object.keys(value)) {
              console.log('found another object', key, label, value)
            } else {
              html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
            }
          })

          html += '</dl><code>}</code></dd>'
        }
      }
      else {
        var label = key
        var value = configs[config][key]

        if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
          if (value) {
            value = __getFormattedDate(new Date(value))
          }
        }

        if (label == 'guessedWords') {
          if (value) {
            html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
          } else {
            html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
          }
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })
  })

  html += '</dl>'

  return html
}
// modal: debug: prettily display Bogdle.state
function _displayGameState() {
  let states = Bogdle.state

  var html = ''

  html += '<dl>'

  Object.keys(states).forEach(state => {
    html += `<h4>STATE: ${state}</h4>`

    Object.keys(states[state]).forEach(key => {
      if (typeof states[state][key] == 'object'
        && !Array.isArray(states[state][key])
        && states[state][key] != null
      ) {
        html += `<dd><code>${key}: {</code><dl>`

        if (key == 'statistics') {
          Object.keys(states[state][key]).forEach(subkey => {
            var label = subkey
            var value = states[state][key][subkey]

            html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
          })

          html += '</dl><code>}</code></dd>'
        }
        else {
          Object.keys(states[state][key]).forEach(k => {
            var label = k
            var value = states[state][key][k]

            if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
              value = __getFormattedDate(new Date(value))
            }

            if (value) {
              html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
            }
          })

          html += '</dl><code>}</code></dd>'
        }
      } else {
        var label = key
        var value = states[state][key]

        if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
          if (value) {
            value = __getFormattedDate(new Date(value))
          }
        }

        if (label == 'guessedWords') {
          if (value) {
            html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
          } else {
            html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
          }
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })
  })

  html += '</dl>'

  return html
}
// modal: debug: pretty display of words in solution
function _displayGameSolution() {
  let html = ''

  // display FREE solution
  html += `<h3>Game Mode: FREE</h3>`
  html += `<h5>Difficulty: ${Bogdle.state.free.difficulty}</h5>`

  html += '<ul>'

  // check each length category (max...3, etc.)
  Object.keys(Bogdle.config.free.solutionSet).reverse().forEach(key => {
    if (key <= __getMaxWordLength()) {
      var words = []

      html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

      // create sorted array of each length category's words
      var sortedArr = Array.from(Object.keys(Bogdle.config.free.solutionSet[key])).sort()

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

  // display DAILY solution
  html += `<h3>Game Mode: DAILY</h3>`
  html += '<ul>'

  // check each length category (max...3, etc.)
  Object.keys(Bogdle.config.daily.solutionSet).reverse().forEach(key => {
    var words = []

    html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

    // create sorted array of each length category's words
    var sortedArr = Array.from(Object.keys(Bogdle.config.daily.solutionSet[key])).sort()

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

// initialize hint system when button clicked
function _initHint() {
  // console.log('checking for hintWord...')

  if (!Bogdle.config[__getMode()].hintWord) {
    const wordsLeft = __getUnGuessedWords()
    Bogdle.config[__getMode()].hintWord = wordsLeft[Math.floor(Math.random() * wordsLeft.length)]

    // console.log('hintWord created:', Bogdle.config[__getMode()].hintWord.toUpperCase())

    Array.from(Bogdle.config[__getMode()].hintWord).forEach(l => Bogdle.config[__getMode()].tempWord.push('_'))

    Bogdle.dom.interactive.btnHintReset.classList.add('show')

    // console.log('tempWord reset:', Bogdle.config[__getMode()].tempWord.join(' ').toUpperCase())
  } else {
    // console.log('hintWord already existing:', Bogdle.config[__getMode()].hintWord.toUpperCase())
  }

  _cycleHint()
}
// continually add letters to hint until max reached
function _cycleHint() {
  // console.log('cycling hintWord status...')

  var maxLetters = Math.floor(Bogdle.config[__getMode()].hintWord.length / 2)

  if (Bogdle.config[__getMode()].hintWord.length > 4) maxLetters += 1

  // console.log(`length: ${Bogdle.config[__getMode()].hintWord.length}, maxLetters: ${maxLetters}, count: ${Bogdle.config[__getMode()].tempWordCounter}`)

  // if we haven't yet revealed enough letters,
  // change a _ to a letter
  if (Bogdle.config[__getMode()].tempWordCounter < maxLetters) {
    var idx = 0
    var foundEmpty = false

    while (!foundEmpty) {
      idx = Math.floor(Math.random() * Bogdle.config[__getMode()].hintWord.length)
      if (Bogdle.config[__getMode()].hintWord[idx]) {
        if (Bogdle.config[__getMode()].tempWord[idx] == '_') {
          Bogdle.config[__getMode()].tempWord[idx] = Bogdle.config[__getMode()].hintWord[idx];
          foundEmpty = true
        }
      }
    }

    // console.log('Bogdle.config[__getMode()].tempWord', Bogdle.config[__getMode()].tempWord.join(' ').toUpperCase())

    Bogdle.dom.interactive.btnHint.innerHTML = Bogdle.config[__getMode()].tempWord.join('')

    Bogdle.config[__getMode()].tempWordCounter++
  }

  if (Bogdle.config[__getMode()].tempWordCounter == maxLetters) {
    // console.log('maxLetters reached, no more letters')

    Bogdle.dom.interactive.btnHint.classList.add('not-a-button')
    Bogdle.dom.interactive.btnHint.setAttribute('disabled', true)
  }
}
// change not-a-button hint back to button hint
function _clearHint() {
  // console.log('clearing hintWord...')

  Bogdle.dom.interactive.btnHint.classList.remove('not-a-button')
  Bogdle.dom.interactive.btnHint.removeAttribute('disabled')
  Bogdle.dom.interactive.btnHint.innerHTML = 'HINT?'

  Bogdle.dom.interactive.btnHintReset.classList.remove('show')

  Bogdle.config[__getMode()].hintWord = null
  Bogdle.config[__getMode()].tempWord = []
  Bogdle.config[__getMode()].tempWordCounter = 0
}

// handle both clicks and touches outside of modals
function _handleClickTouch(event) {
  var dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    var isConfirm = dialog.classList.contains('modal-confirm')

    // only close if not a confirmation!
    if (event.target == dialog && !isConfirm) {
      dialog.remove()
    }
  }

  if (event.target == Bogdle.dom.status.navOverlay) {
    Bogdle.dom.status.navOverlay.classList.toggle('show')
  }
}

// add event listeners to DOM
function _attachEventListeners() {
  // {} header icons to open modals
  Bogdle.dom.interactive.btnNav.addEventListener('click', () => {
    Bogdle.dom.status.navOverlay.classList.toggle('show')
  })
  Bogdle.dom.interactive.btnNavClose.addEventListener('click', () => {
    Bogdle.dom.status.navOverlay.classList.toggle('show')
  })
  Bogdle.dom.interactive.btnHelp.addEventListener('click', () => modalOpen('help'))
  Bogdle.dom.interactive.btnStats.addEventListener('click', () => modalOpen('stats'))
  Bogdle.dom.interactive.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // [A] tile interaction
  Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
    tile.addEventListener('click', (t) => {
      _onTileClick(t)
    })
  })

  // ❔ hint
  Bogdle.dom.interactive.btnHint.addEventListener('click', () => {
    _initHint()
  })

  // X hint reset
  Bogdle.dom.interactive.btnHintReset.addEventListener('click', () => {
    _clearHint()
  })

  // ✅ submit word
  Bogdle.dom.interactive.btnSubmit.addEventListener('click', () => {
    _submitWord(Bogdle.dom.status.guess.innerHTML)
  })

  // ⌫ backspace
  Bogdle.dom.interactive.btnBackspace.addEventListener('click', () => {
    _removeLastLetter()
  })

  // X clear
  Bogdle.dom.interactive.btnClearGuess.addEventListener('click', () => {
    _resetInput()
  })

  // 🔀 shuffle
  Bogdle.dom.interactive.btnShuffle.addEventListener('click', () => {
    _shuffleTiles()
  })

  // := show current game word list progress
  Bogdle.dom.interactive.btnShowProgress.addEventListener('click', () => {
    modalOpen('show-progress')
  })

  // + create new solution
  Bogdle.dom.interactive.debug.btnCreateNew.addEventListener('click', () => {
    _confirmFreeCreateNew()
  })

  // 📕 dictionary lookup
  Bogdle.dom.interactive.btnGuessLookup.addEventListener('click', () => {
    if (Bogdle.dom.status.guess.classList.contains('valid')) {
      modalOpen('dictionary')
    }
  })

  // local debug buttons
  if (Bogdle.env == 'local') {
    if (Bogdle.dom.interactive.debug.all) {
      // := show list of words
      Bogdle.dom.interactive.debug.btnShowList.addEventListener('click', () => {
        modalOpen('show-solution')
      })

      // ⚙ show current bogdle config
      Bogdle.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })

      // 🎚️ show current bogdle state
      Bogdle.dom.interactive.debug.btnShowState.addEventListener('click', () => {
        modalOpen('show-state')
      })
    }
  }

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    if (event.code == 'Enter') {
      _submitWord(Bogdle.dom.status.guess.innerHTML)
    } else if (event.code == 'Backspace' || event.code == 'Delete') {
      _removeLastLetter()
    } else {
      var excludedKeys = ['Alt', 'Control', 'Meta', 'Shift']
      var validLetters = Bogdle.config[__getMode()].letters.map(l => l.toUpperCase())
      var pressedLetter = event.code.charAt(event.code.length - 1)

      if (!excludedKeys.some(key => event.getModifierState(key))) {
        // console.log('no modifier key is being held, so trigger letter')

        if (validLetters.includes(pressedLetter)) {
          // find any available tiles to select
          var boardTiles = Array.from(Bogdle.dom.interactive.tiles)

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
            Bogdle.config[__getMode()].tilesSelected.push(tileToPush.dataset.pos)

            // add selected tile to guess
            Bogdle.dom.status.guess.innerHTML += tileToPush.innerHTML

            audioPlay('tile_click')

            // check guess for validity
            _checkGuess()
          }
        }
      } else {
        // console.log('a modifier key is being held, so ignore letter', event)
      }
    }
  })

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', _handleClickTouch)
  window.addEventListener('touchend', _handleClickTouch)

  window.onload = _resizeBoard
  window.onresize = _resizeBoard

  // console.log('added event listeners')
}

// get displayable string for today's date
function _todaysDate() {
  const d = new Date(Date.now())
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return `${days[d.getDay()]}, ${months[d.getMonth() + 1]} ${d.getDate()}, ${d.getFullYear()}`
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

// shorter gameMode deducer
function __getMode() {
  return Bogdle.settings.gameMode
}

// load random start word for solution set
async function __getNewStartWord() {
  // gets max-length start words via fetch()
  // if success, grabs a random one

  const response = await fetch(Bogdle.config[__getMode()].startWordsFile)
  const responseJson = await response.json()

  // random max-length word
  let possibles = responseJson['9']
  let possibleIdx = Math.floor(Math.random() * possibles.length)

  this.seedWord = possibles[possibleIdx]

  return this.seedWord
}

// get array of words not yet guessed for hint system
function __getUnGuessedWords() {
  var words = Bogdle.config[__getMode()].solutionSet
  var wordsLeft = []

  Object.keys(words).forEach(length => {
    Object.keys(words[length]).forEach(word => {
      if (!words[length][word]) {
        wordsLeft.push(word)
      }
    })
  })

  return wordsLeft
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

// return Bogdle.config[__getMode()].solutionSet size
function __getSolutionSize() {
  let categorySize = 0
  let solutionSize = 0

  Object.keys(Bogdle.config[__getMode()].solutionSet).forEach(category => {
    if (parseInt(category) <= __getMaxWordLength()) {
      categorySize = Object.keys(Bogdle.config[__getMode()].solutionSet[category]).length
      solutionSize += categorySize
    }
  })

  // console.log('__getSolutionSize()', solutionSize)

  return solutionSize
}

// helper method to get game difficulty as a max letter length
function __getMaxWordLength() {
  const diff = Bogdle.state[__getMode()].difficulty
  const max = DIFF_TO_LENGTH[diff]

  return max
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Bogdle.init()
