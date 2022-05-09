// global namespace
this.bogdle = this.bogdle || {}
this.bogdle.settings = {}

// global settings
this.bogdle.settings.darkMode = false
this.bogdle.settings.gameMode = 'free'
this.bogdle.settings.noisy = false

// state: keep track of stuff that DOES go to localStorage
this.bogdle.state = {}
// state->daily
this.bogdle.state.daily = {}
// state->free
this.bogdle.state.free = {}

// config: keep track of stuff that DOES NOT go to localStorage
this.bogdle.config = {}
// config->daily
this.bogdle.config.daily = {}
this.bogdle.config.daily.solutionSet = EMPTY_OBJ_SET
// config->free
this.bogdle.config.free = {}
this.bogdle.config.free.hintWord = null
this.bogdle.config.free.seedWord = 'scenarios'
this.bogdle.config.free.tempWord = []
this.bogdle.config.free.tempWordCounter = 0

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
      var word = this.bogdle.dom.status.guess.innerHTML

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
                <div class="statistic">${this.bogdle.state.daily.statistics.gamesPlayed}</div>
                <div class="statistic-label">Games Played</div>
              </div>
              <div class="statistic-container">
                <div class="statistic">${this.bogdle.state.daily.statistics.wordsFound}</div>
                <div class="statistic-label">Words Found</div>
              </div>
            </div>

            <div class="statistic-header">Free Play</div>
            <div class="statistics">
              <div class="statistic-container">
                <div class="statistic">${this.bogdle.state.free.statistics.gamesPlayed}</div>
                <div class="statistic-label">Games Played</div>
              </div>
              <div class="statistic-container">
                <div class="statistic">${this.bogdle.state.free.statistics.wordsFound}</div>
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
this.bogdle.init = async () => {
  // console.log('init started')

  // set env
  this.bogdle.env = document.location.hostname == ENV_PROD_URL ? 'prod' : 'local'

  // disable lookup
  this.bogdle.dom.interactive.btnGuessLookup.disabled = true

  // if local dev, show debug stuff
  if (this.bogdle.env == 'local') {
    _initDebug()
  }

  _initAudio()

  // attach event listeners to DOM elements
  _addEventListeners()

  // load localStorage game state
  _loadGameState()

  // console.log('!bogdle has been initialized!')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// add debug stuff if local
function _initDebug() {
  // if debug buttons are in template
  if (this.bogdle.dom.interactive.debug.all) {
    // show debug buttons
    this.bogdle.dom.interactive.debug.all.style.display = 'flex'
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

// load state/statistics from LS -> code model
async function _loadGameState() {
  var lsStateDaily = JSON.parse(localStorage.getItem(LS_STATE_DAILY_KEY))

  // load daily game state
  if (lsStateDaily) {
    // console.log('localStorage DAILY state key found and loading...', lsStateDaily)

    this.bogdle.state.daily.gameState = lsStateDaily.gameState
    this.bogdle.state.daily.guessedWords = lsStateDaily.guessedWords
    this.bogdle.state.daily.lastCompletedTime = lsStateDaily.lastCompletedTime
    this.bogdle.state.daily.lastPlayedTime = lsStateDaily.lastPlayedTime
    this.bogdle.state.daily.statistics = {
      "gamesPlayed": lsStateDaily.statistics.gamesPlayed,
      "wordsFound": lsStateDaily.statistics.wordsFound
    }

    // no lastPlayedTime?
    if (this.bogdle.state.daily.lastPlayedTime == null) {
      modalOpen('help')
    }

    // console.log('!localStorage DAILY key loaded!', this.bogdle.state.daily)
  } else {
    // console.log('no localStorage DAILY key found; defaults being set')

    this.bogdle.state.daily.gameState = 'IN_PROGRESS'
    this.bogdle.state.daily.guessedWords = []
    this.bogdle.state.daily.lastCompletedTime = null
    this.bogdle.state.daily.lastPlayedTime = null
    this.bogdle.state.daily.statistics = {
      "gamesPlayed": 0,
      "wordsFound": 0
    }
  }

  var lsStateFree = JSON.parse(localStorage.getItem(LS_STATE_FREE_KEY))

  // load free game state
  if (lsStateFree) {
    // console.log('localStorage FREE state key found and loading...', lsStateFree)

    this.bogdle.state.free.difficulty = lsStateFree.difficulty
    this.bogdle.state.free.gameState = lsStateFree.gameState
    this.bogdle.state.free.guessedWords = lsStateFree.guessedWords
    this.bogdle.state.free.lastCompletedTime = lsStateFree.lastCompletedTime
    this.bogdle.state.free.lastPlayedTime = lsStateFree.lastPlayedTime
    this.bogdle.state.free.statistics = {
      "gamesPlayed": lsStateFree.statistics.gamesPlayed,
      "wordsFound": lsStateFree.statistics.gamesPlayed
    }

    await _loadExistingSolutionSet(this.bogdle.config.free.seedWord)

    // console.log('!localStorage FREE key loaded!', this.bogdle.state.free)
  } else {
    // console.log('no localStorage FREE key found; defaults being set')

    this.bogdle.state.free.difficulty = 'normal'
    this.bogdle.state.free.gameState = 'IN_PROGRESS'
    this.bogdle.state.free.guessedWords = []
    this.bogdle.state.free.lastCompletedTime = null
    this.bogdle.state.free.lastPlayedTime = null
    this.bogdle.state.free.statistics = {
      "gamesPlayed": 0,
      "wordsFound": 0
    }

    if (this.bogdle.env == 'prod') {
      await _createNewSolutionSet()
    } else {
      await _createNewSolutionSet(this.bogdle.config.free.seedWord)
    }
  }

  // load global (gear icon) settings
  _loadGlobalSettings()

  _saveGameState()

  if (!lsStateDaily && !lsStateFree) {
    modalOpen('start')
  }

  // console.log('!daily progress loaded!', this.bogdle.config.daily.solutionSet)
  // console.log('!free progress loaded!', this.bogdle.config.free.solutionSet)
}

// save game state/settings from code model -> LS
function _saveGameState() {
  // console.log('saving game state and global settings to localStorage...')

  // save daily game state
  try {
    localStorage.setItem(LS_STATE_DAILY_KEY, JSON.stringify(this.bogdle.state.daily))

    // console.log('!localStorage DAILY state saved!', JSON.parse(localStorage.getItem(LS_STATE_DAILY_KEY)))
  } catch(error) {
    console.error('localStorage DAILY state save failed', error)
  }

  // save free game state
  try {
    localStorage.setItem(LS_STATE_FREE_KEY, JSON.stringify(this.bogdle.state.free))

    // console.log('!localStorage FREE state saved!', JSON.parse(localStorage.getItem(LS_STATE_FREE_KEY)))
  } catch(error) {
    console.error('localStorage FREE state save failed', error)
  }

  // save global game settings
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(this.bogdle.settings))

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
  this.bogdle.settings[setting] = value

  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings))

  // console.log('!global setting saved!', this.bogdle.settings)
}
// load settings (gear icon) from localStorage
function _loadGlobalSettings() {
  // console.log('loading global settings from LS...')

  // STATE->GAMEMODE
  if (this.bogdle.settings.gameMode == 'free') {
    this.bogdle.dom.interactive.difficultyContainer.classList.add('show')
  }

  // STATE->FREE->DIFFICULTY
  if (localStorage.getItem(LS_STATE_FREE_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_FREE_KEY))

    if (lsConfig) {
      if (lsConfig.difficulty) {
        this.bogdle.dom.interactive.difficultyContainerLinks.forEach(link => link.dataset.active = false)
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
        this.bogdle.settings.darkMode = lsConfig.darkMode

        document.body.classList.add('dark-mode')

        var setting = document.getElementById('button-setting-dark-mode')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsConfig.noisy) {
        this.bogdle.settings.noisy = lsConfig.noisy

        var setting = document.getElementById('button-setting-noisy')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }
  } else {
    this.bogdle.settings.darkMode = false
    this.bogdle.settings.gameMode = 'free'
    this.bogdle.settings.noisy = false
  }

  // console.log('loaded global settings from LS!', this.bogdle.settings)
}

// create new solution set, which resets progress
async function _createNewSolutionSet(newWord = null) {
  // console.log('creating a new solution set...')

  // default config and stats (both save to, and are loaded from, localStorage)
  if (!this.bogdle.state.free.difficulty) {
    this.bogdle.state.free.difficulty = 'normal'
  }

  this.bogdle.state.free.gameState = 'IN_PROGRESS'
  this.bogdle.state.free.guessedWords = []
  this.bogdle.state.free.lastCompletedTime = null
  this.bogdle.state.free.lastPlayedTime = null

  // dictionary to pull from
  this.bogdle.config.free.dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[this.bogdle.state.free.difficulty]]}/words_3-${_getMaxWordLength()}.json`

  this.bogdle.config.free.letters = []

  // grab appopriate EMPTY_OBJ_SET
  switch (DIFF_TO_LENGTH[parseInt(this.bogdle.difficulty)]) {
    case 3: this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET_3; break
    case 5: this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET_5; break
    case 7: this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET_7; break
    case 9:
    default:
      this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET; break
  }

  // construct start words file
  this.bogdle.config.free.startWordsFile = './assets/json/'
  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  this.bogdle.config.free.startWordsFile += WORD_SOURCES[DIFFICULTY[this.bogdle.state.free.difficulty]]
  this.bogdle.config.free.startWordsFile += `/words_9-9.json`

  // console.log('this.bogdle.config.free.startWordsFiles', this.bogdle.config.free.startWordsFile)

  // keep track of which tiles have been selected
  this.bogdle.config.free.tilesSelected = []

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

  this.bogdle.config.free.seedWord = newWord

  // create new game
  try {
    const findle = await createFindle(
      this.bogdle.config.free.seedWord,
      this.bogdle.config.free.dictionary,
      this.bogdle.state.free
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
        this.bogdle.config.free.solutionSet[category] = {}
      })

      // create bogdle's solution set
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (!this.bogdle.config.free.solutionSet[key.toString()][word]) {
            this.bogdle.config.free.solutionSet[key.toString()][word] = {}
          }

          this.bogdle.config.free.solutionSet[key.toString()][word] = 0
        })
      })

      // console.log('test: this.bogdle.config.free.solutionSet', this.bogdle.config.free.solutionSet)

      // set tile letter tracking
      this.bogdle.config.free.letters = newWord.split('')

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
  // console.log('loading existing solution set...')

  // dictionary to pull from
  this.bogdle.config.free.dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[this.bogdle.state.free.difficulty]]}/words_3-${_getMaxWordLength()}.json`

  this.bogdle.config.free.letters = []

  switch (_getMaxWordLength()) {
    case 3: this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET_3; break
    case 5: this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET_5; break
    case 7: this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET_7; break
    case 9:
    default:
      this.bogdle.config.free.solutionSet = EMPTY_OBJ_SET; break
  }

  this.bogdle.config.free.startWordsFile = './assets/json/'
  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  this.bogdle.config.free.startWordsFile += WORD_SOURCES[DIFFICULTY[this.bogdle.state.free.difficulty]]
  this.bogdle.config.free.startWordsFile += `/words_9-9.json`

  // console.log('this.bogdle.config.free.startWordsFiles', this.bogdle.config.free.startWordsFile)

  // keep track of which tiles have been selected
  this.bogdle.config.free.tilesSelected = []

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

  this.bogdle.config.free.seedWord = newWord

  // load existing game
  try {
    const findle = await createFindle(
      this.bogdle.config.free.seedWord,
      this.bogdle.config.free.dictionary,
      this.bogdle.state.free
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
        this.bogdle.config.free.solutionSet[category] = {}
      })

      // re-create bogdle's solution set
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (!this.bogdle.config.free.solutionSet[key.toString()][word]) {
            this.bogdle.config.free.solutionSet[key.toString()][word] = {}
          }

          this.bogdle.config.free.solutionSet[key.toString()][word] = 0
        })
      })

      // set tile letter tracking
      this.bogdle.config.free.letters = newWord.split('')

      // if just changing difficulty, clear guessedWords
      if (isNewDiff) {
        this.bogdle.state.free.guessedWords = []
        _setScore(0)
        _saveGameState()
      } // else check for pre-guessed words
      else {
        var lsConfig = JSON.parse(localStorage.getItem(LS_STATE_DAILY_KEY))

        this.bogdle.state.free.guessedWords = []

        // console.log('checking off pre-guessed words...', lsConfig)

        if (lsConfig.guessedWords && lsConfig.guessedWords.length) {
          // console.log('found some pre-guessed words, so adding to code')

          lsConfig.guessedWords.forEach(word => {
            this.bogdle.state.free.guessedWords.push(word)
            this.bogdle.config.free.solutionSet[word.length][word] = 1
          })

          // console.log('loaded existing solutionSet and checked off pre-guessed words', this.bogdle.config.free.solutionSet)

          // set score to existing number of guessedWords
          _setScore(this.bogdle.state.free.guessedWords.length)
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
async function _confirmCreateNew() {
  this.myConfirm = new Modal('confirm', 'Create New Puzzle?',
    'Are you <strong>sure</strong> you want to create a new puzzle?',
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

// reset config and LS
async function _resetProgress() {
  // console.log('resetting progress...')

  // set config to defaults
  this.bogdle.state.free = {
    "difficulty": this.bogdle.state.free.difficulty,
    "gameState": "IN_PROGRESS",
    "guessedWords": [],
    "lastCompletedTime": null,
    "lastPlayedTime": null,
    "statistics": {
      "gamesPlayed": 0,
      "wordsFound": 0
    }
  }

  this.bogdle.config.free.dictionary = `./assets/json/${WORD_SOURCES[DIFFICULTY[this.bogdle.state.free.difficulty]]}/words_3-${_getMaxWordLength()}.json`

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
async function _changeSetting(setting, value) {
  switch (setting) {
    // case 'gameMode':
    //   var target = value.target

    //   if (value == 'daily') {
    //     try {
    //       const response = await fetch('scripts/daily.php')
    //       const responseWord = await response.text()

    //       if (responseWord) {
    //         console.log('daily word to use', responseWord)
    //       }
    //     } catch (e) {
    //       console.error('could not get daily word', e)
    //     }
    //   }
    //   break
    case 'difficulty':
      var target = value.target
      var oldDiff = this.bogdle.state.free.difficulty
      var newDiff = target.dataset.diffid

      // don't prompt unless new difficulty
      if (newDiff != oldDiff) {
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
            this.bogdle.state.free.difficulty = newDiff

            // set dom status
            document.getElementById(`diff-${oldDiff}`).dataset.active = false
            document.getElementById(target.id).dataset.active = true

            _clearHint()

            // start a new game with newDiff (but using current seedWord)
            _loadExistingSolutionSet(this.bogdle.config.free.seedWord, true)
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

  if (this.bogdle.state.free.gameState == 'IN_PROGRESS') {
    if (word.length > 2) {
      if (typeof this.bogdle.config.free.solutionSet[word.length][word] != 'undefined') {
        if (this.bogdle.config.free.solutionSet[word.length][word] !== 1) {

          if (word.length == _getMaxWordLength()) {
            audioPlay(`doo-dah-doo`)
          } else {
            // choose haaahs[1-3] at random and play
            var num = Math.floor(Math.random() * 3) + 1
            audioPlay(`haaahs${num}`)
          }

          if (!this.bogdle.state.free.guessedWords) {
            this.bogdle.state.free.guessedWords = []
          }

          this.bogdle.state.free.guessedWords.push(word)
          this.bogdle.state.free.guessedWords.sort()
          this.bogdle.state.free.lastPlayedTime = new Date().getTime()
          this.bogdle.state.free.statistics.wordsFound += 1

          this.bogdle.config.free.solutionSet[word.length][word] = 1

          this.bogdle.dom.status.guess.classList.remove('first-guess')

          // do a dance
          animateCSS('#guess', 'tada')

          // clear hint if it's the same word
          if (word == this.bogdle.config.free.hintWord) {
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

  // console.log('!score set!', `${this.bogdle.dom.status.score.innerHTML}`)
}

// game state checking
function _checkGuess() {
  // reset classes
  this.bogdle.dom.status.guess.classList.remove('valid', 'first-guess')
  this.bogdle.dom.interactive.btnGuessLookup.disabled = true

  // player entered valid word length
  if (this.bogdle.dom.status.guess.innerHTML.length > 2) {
    var word = this.bogdle.dom.status.guess.innerHTML.trim()

    // player guessed a valid word
    Object.keys(this.bogdle.config.free.solutionSet).forEach(key => {
      if (parseInt(key) <= _getMaxWordLength()) {
        if (Object.keys(this.bogdle.config.free.solutionSet[key]).includes(word)) {
          this.bogdle.dom.status.guess.classList.toggle('valid')
          this.bogdle.dom.interactive.btnGuessLookup.disabled = false

          // and it's the first time
          if (!this.bogdle.config.free.solutionSet[key][word]) {
            this.bogdle.dom.status.guess.classList.add('first-guess')
            animateCSS('#guess', 'pulse')
          }
        } else {
          // player guessed an invalid word (not on list)
          this.bogdle.dom.interactive.btnGuessLookup.disabled = true
        }
      }
    })
  } else {
    // player guessed an invalid word (not long enough)
  }
}
function _checkWinState() {
  // console.log('checking for win state...', this.bogdle.config.free.solutionSet)

  if (this.bogdle.config.free.solutionSet) {
    if (Object.values(this.bogdle.config.free.solutionSet).every((val) => val == 1)) {
      // console.log('_checkWinState(): game won!', this.bogdle.config.free.solutionSet)

      if (this.bogdle.state.free.gameState == 'IN_PROGRESS') {
        this.bogdle.state.daily.statistics.gamesPlayed += 1
      }

      // display modal win thingy
      modalOpen('win')

      // set config stuff
      this.bogdle.state.free.gameState = 'GAME_OVER'

      if (this.bogdle.state.free.lastCompletedTime == null) {
        this.bogdle.state.free.lastCompletedTime = new Date().getTime()
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
  let letters = this.bogdle.config.free.letters

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
  this.bogdle.dom.interactive.btnGuessLookup.disabled = true
}
// remove last letter in DOM guess div
function _removeLastLetter() {
  if (this.bogdle.state.free.gameState == 'IN_PROGRESS') {
    // remove last position from selected array
    if (this.bogdle.config.free.tilesSelected.length) {
      var last = this.bogdle.config.free.tilesSelected.pop()

      Array.from(this.bogdle.dom.interactive.tiles).forEach(tile => {
        if (tile.dataset.pos == last) {
          tile.dataset.state = 'tbd'
        }
      })
    }

    // remove last letter of active guess
    if (this.bogdle.dom.status.guess.innerHTML.length) {
      this.bogdle.dom.status.guess.innerHTML = this.bogdle.dom.status.guess.innerHTML.slice(0, this.bogdle.dom.status.guess.innerHTML.length - 1)

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
  var tileStatus = tile.target.dataset.state

  if (tileStatus == 'tbd') {
    animateCSS(`#${tile.target.id}`, 'pulse')

    // change tile status
    tile.target.dataset.state = 'selected'

    // push another selected tile onto selected array
    this.bogdle.config.free.tilesSelected.push(tile.target.dataset.pos)

    // add selected tile to guess
    this.bogdle.dom.status.guess.innerHTML += tile.target.innerHTML

    audioPlay('tile_click')

    // check guess for validity
    _checkGuess()
  }
}

// modal: show how many words have been guessed
function _displayGameProgress() {
  var gameMode = this.bogdle.gameMode
  var html = ''

  if (gameMode == 'free') {
    html += `<h6>Difficulty: ${this.bogdle.state.free.difficulty}</h6>`
  }

  html += '<ul>'

  // check each length category (max...3, etc.)
  // total up words guessed in each
  Object.keys(this.bogdle.config.free.solutionSet).reverse().forEach(category => {
    if (parseInt(category) <= _getMaxWordLength()) {
      html += `<li><span class="solution-category">${category}-LETTER</span>`

      var categoryEntries = Object.entries(this.bogdle.config.free.solutionSet[category])
      var categoryGuessed = categoryEntries
        .filter(entry => entry[1])

      categoryLength = Object.keys(this.bogdle.config.free.solutionSet[category])
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

// modal: debug: prettily display this.bogdle.config
function _displayGameConfig() {
  let configs = this.bogdle.config

  var html = ''

  html += `<h4>GLOBAL (ENV: ${this.bogdle.env})</h4>`
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
// modal: debug: prettily display this.bogdle.state
function _displayGameState() {
  let states = this.bogdle.state

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
  var html = ''

  // display FREE solution
  html += `<h3>Game Mode: FREE</h3>`
  html += `<h5>Difficulty: ${this.bogdle.state.free.difficulty}</h5>`

  html += '<ul>'

  // check each length category (max...3, etc.)
  Object.keys(this.bogdle.config.free.solutionSet).reverse().forEach(key => {
    if (key <= _getMaxWordLength()) {
      var words = []

      html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

      // create sorted array of each length category's words
      var sortedArr = Array.from(Object.keys(this.bogdle.config.free.solutionSet[key])).sort()

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
  Object.keys(this.bogdle.config.daily.solutionSet).reverse().forEach(key => {
    var words = []

    html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

    // create sorted array of each length category's words
    var sortedArr = Array.from(Object.keys(this.bogdle.config.daily.solutionSet[key])).sort()

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

// get max word length via difficulty setting
function _getMaxWordLength() {
  var diff = this.bogdle.state.free.difficulty

  // console.log('diff', diff)

  var max = DIFF_TO_LENGTH[diff]

  // console.log('max', max)

  return max
}

// hint functions
function _initHint() {
  // console.log('checking for hintWord...')

  if (!this.bogdle.config.free.hintWord) {
    const wordsLeft = __getUnGuessedWords()
    this.bogdle.config.free.hintWord = wordsLeft[Math.floor(Math.random() * wordsLeft.length)]

    // console.log('hintWord created:', this.bogdle.config.free.hintWord.toUpperCase())

    Array.from(this.bogdle.config.free.hintWord).forEach(l => this.bogdle.config.free.tempWord.push('_'))

    this.bogdle.dom.interactive.btnHintReset.classList.add('show')

    // console.log('tempWord reset:', this.bogdle.config.free.tempWord.join(' ').toUpperCase())
  } else {
    // console.log('hintWord already existing:', this.bogdle.config.free.hintWord.toUpperCase())
  }

  _cycleHint()
}
function _cycleHint() {
  // console.log('cycling hintWord status...')

  var maxLetters = Math.floor(this.bogdle.config.free.hintWord.length / 2)

  if (this.bogdle.config.free.hintWord.length > 4) maxLetters += 1

  // console.log(`length: ${this.bogdle.config.free.hintWord.length}, maxLetters: ${maxLetters}, count: ${this.bogdle.config.free.tempWordCounter}`)

  // if we haven't yet revealed enough letters,
  // change a _ to a letter
  if (this.bogdle.config.free.tempWordCounter < maxLetters) {
    var idx = 0
    var foundEmpty = false

    while (!foundEmpty) {
      idx = Math.floor(Math.random() * this.bogdle.config.free.hintWord.length)
      if (this.bogdle.config.free.hintWord[idx]) {
        if (this.bogdle.config.free.tempWord[idx] == '_') {
          this.bogdle.config.free.tempWord[idx] = this.bogdle.config.free.hintWord[idx];
          foundEmpty = true
        }
      }
    }

    // console.log('this.bogdle.config.free.tempWord', this.bogdle.config.free.tempWord.join(' ').toUpperCase())

    this.bogdle.dom.interactive.btnHint.innerHTML = this.bogdle.config.free.tempWord.join('')

    this.bogdle.config.free.tempWordCounter++
  }

  if (this.bogdle.config.free.tempWordCounter == maxLetters) {
    // console.log('maxLetters reached, no more letters')

    this.bogdle.dom.interactive.btnHint.classList.add('not-a-button')
    this.bogdle.dom.interactive.btnHint.setAttribute('disabled', true)
  }
}
function _clearHint() {
  // console.log('clearing hintWord...')

  this.bogdle.dom.interactive.btnHint.classList.remove('not-a-button')
  this.bogdle.dom.interactive.btnHint.removeAttribute('disabled')
  this.bogdle.dom.interactive.btnHint.innerHTML = 'HINT?'

  this.bogdle.dom.interactive.btnHintReset.classList.remove('show')

  this.bogdle.config.free.hintWord = null
  this.bogdle.config.free.tempWord = []
  this.bogdle.config.free.tempWordCounter = 0
}

// helper method to get game difficulty as a max letter length
function _getMaxWordLength() {
  return DIFF_TO_LENGTH[this.bogdle.state.free.difficulty]
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
}

// add event listeners to DOM
function _addEventListeners() {
  // {} header icons to open modals
  // this.bogdle.dom.interactive.btnNav.addEventListener('click', () => this.bogdle.dom.status.navOverlay.classList.toggle('show'))
  this.bogdle.dom.interactive.btnHelp.addEventListener('click', () => modalOpen('help'))
  this.bogdle.dom.interactive.btnStats.addEventListener('click', () => modalOpen('stats'))
  this.bogdle.dom.interactive.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // [A] tile interaction
  Array.from(this.bogdle.dom.interactive.tiles).forEach(tile => {
    tile.addEventListener('click', (t) => {
      _onTileClick(t)
    })
  })

  // ❔ hint
  this.bogdle.dom.interactive.btnHint.addEventListener('click', () => {
    _initHint()
  })

  // X hint reset
  this.bogdle.dom.interactive.btnHintReset.addEventListener('click', () => {
    _clearHint()
  })

  // ✅ submit word
  this.bogdle.dom.interactive.btnSubmit.addEventListener('click', () => {
    _submitWord(this.bogdle.dom.status.guess.innerHTML)
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

  // + create new solution
  this.bogdle.dom.interactive.debug.btnCreateNew.addEventListener('click', () => {
    _confirmCreateNew()
  })

  // 📕 dictionary lookup
  this.bogdle.dom.interactive.btnGuessLookup.addEventListener('click', () => {
    if (this.bogdle.dom.status.guess.classList.contains('valid')) {
      modalOpen('dictionary')
    }
  })

  // local debug buttons
  if (this.bogdle.env == 'local') {
    if (this.bogdle.dom.interactive.debug.all) {
      // := show list of words
      this.bogdle.dom.interactive.debug.btnShowList.addEventListener('click', () => {
        modalOpen('show-solution')
      })

      // ⚙ show current bogdle config
      this.bogdle.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })

      // 🎚️ show current bogdle state
      this.bogdle.dom.interactive.debug.btnShowState.addEventListener('click', () => {
        modalOpen('show-state')
      })
    }
  }

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    if (event.code == 'Enter') {
      _submitWord(this.bogdle.dom.status.guess.innerHTML)
    } else if (event.code == 'Backspace' || event.code == 'Delete') {
      _removeLastLetter()
    } else {
      var excludedKeys = ['Alt', 'Control', 'Meta', 'Shift']
      var validLetters = this.bogdle.config.free.letters.map(l => l.toUpperCase())
      var pressedLetter = event.code.charAt(event.code.length - 1)

      if (!excludedKeys.some(key => event.getModifierState(key))) {
        // console.log('no modifier key is being held, so trigger letter')

        if (validLetters.includes(pressedLetter)) {
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
            this.bogdle.config.free.tilesSelected.push(tileToPush.dataset.pos)

            // add selected tile to guess
            this.bogdle.dom.status.guess.innerHTML += tileToPush.innerHTML

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

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

// load random start word for solution set
async function __getNewStartWord() {
  // gets max-length start words via fetch()
  // if success, grabs a random one

  const response = await fetch(this.bogdle.config.free.startWordsFile)
  const responseJson = await response.json()

  // random max-length word
  let possibles = responseJson['9']
  let possibleIdx = Math.floor(Math.random() * possibles.length)

  this.seedWord = possibles[possibleIdx]

  return this.seedWord
}

function __getUnGuessedWords() {
  var words = this.bogdle.config.free.solutionSet
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

// return this.bogdle.config.free.solutionSet size
function __getSolutionSize() {
  let categorySize = 0
  let solutionSize = 0

  Object.keys(this.bogdle.config.free.solutionSet).forEach(category => {
    if (parseInt(category) <= _getMaxWordLength()) {
      categorySize = Object.keys(this.bogdle.config.free.solutionSet[category]).length
      solutionSize += categorySize
    }
  })

  // console.log('__getSolutionSize()', solutionSize)

  return solutionSize
}

// set up game
this.bogdle.init()
