/* main */
/* app entry point and main functions */
/* global Bogdle */

// settings: saved in LOCAL STORAGE
Bogdle.settings = {
  "darkMode": false,
  "gameMode": 'daily',
  "noisy": false
}

// state: saved between sessions LOCAL STORAGE
Bogdle.state = {}
// state->daily defaults
Bogdle.state.daily = {
  "gameState": 'IN_PROGRESS',
  "guessedWords": [],
  "lastCompletedTime": null,
  "lastPlayedTime": null,
  "seedWord": null,
  "statistics": {
    "gamesPlayed": 0,
    "wordsFound": 0
  }
}
// state->free defaults
Bogdle.state.free = {
  "difficulty": 'normal',
  "gameState": 'IN_PROGRESS',
  "guessedWords": [],
  "lastCompletedTime": null,
  "lastPlayedTime": null,
  "seedWord": null,
  "statistics": {
    "gamesPlayed": 0,
    "wordsFound": 0
  }
}

// config: only saved while game is loaded
Bogdle.config = {}
// config->daily
Bogdle.config.daily = {}
Bogdle.config.daily.hintWord = null
Bogdle.config.daily.hintObscuredWord = []
Bogdle.config.daily.hintObscuredWordCounter = 0
Bogdle.config.daily.solutionSet = EMPTY_OBJ_SET

// config->free
Bogdle.config.free = {}
Bogdle.config.free.hintWord = null
Bogdle.config.free.hintObscuredWord = []
Bogdle.config.free.hintObscuredWordCounter = 0
Bogdle.config.free.solutionSet = EMPTY_OBJ_SET

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
          <p>Find all the words in the jumble of letters! Select each letter in order and then hit the <button class="help"><i class="fa-solid fa-check"></i></button>. Letters don't need to be adjacent (unlike actual Boggle).</p>

          <h4>Daily</h4>
          <p>Each word is 3 to 9 letters long. Come back every day for a new puzzle!</p>

          <h4>Free</h4>
          <p>Each word is at least 3 letters, and as many as the difficulty (KID: 3, EASY: 5, MEDIUM: 7, NORMAL: 9) allows. Play as many puzzles as you'd like. Tap on <button class="help"><i class="fa-solid fa-circle-plus"></i></button> to load a new one.

          <ul class="help">
            <li><button class="help"><i class="fa-solid fa-check"></i></button> Submit word</li>
            <li><button class="help"><i class="fa-solid fa-backspace"></i></button> Delete last letter in guess</li>
            <li><button class="help"><i class="fa-solid fa-xmark"></i></button> Clear entire guess</li>
            <li><button class="help"><i class="fa-solid fa-shuffle"></i></button> Shuffle the tiles</li>
            <li><button class="help"><i class="fa-solid fa-list-check"></i></button> Show current progress</li>
            <li><button class="help"><i class="fa-solid fa-book"></i></button> Lookup valid word in dictionary</li>
            <li><button class="help"><i class="fa-solid fa-circle-plus"></i></button> Create new puzzle (Free mode)</li>
          </ul>

          <hr />

          <p><strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>. <strong>Sound</strong>: Fliss.</p>
        `,
        null,
        null
      )
      break

    case 'dictionary':
      var word = Bogdle.dom.guess.innerHTML

      try {
        const response = await fetch(`${BOGDLE_DEFINE_LOOKUP_URL}/${word}`)
        const responseJson = await response.json()

        if (responseJson) {
          const entry = responseJson[0]

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
                  <div id="button-setting-dark-mode" data-status="" class="switch" onclick="Bogdle._changeSetting('darkMode')">
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
                  <div id="button-setting-noisy" data-status="" class="switch" onclick="Bogdle._changeSetting('noisy')">
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


      Bogdle._loadSettings()

      break

    case 'show-progress':
      this.myModal = new Modal('perm', 'Game Progress',
        Bogdle._displayGameProgress(),
        null,
        null
      )
      break

    case 'show-solution':
      this.myModal = new Modal('perm-debug', 'Master Word List',
        Bogdle._displayGameSolution(),
        null,
        null
      )
      break
    case 'show-config':
      this.myModal = new Modal('perm-debug', 'Game Config (code model only)',
        Bogdle._displayGameConfig(),
        null,
        null
      )
      break
    case 'show-state':
      this.myModal = new Modal('perm-debug', 'Game State (load/save to LS)',
        Bogdle._displayGameState(),
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
Bogdle.initApp = async () => {
  // console.log('Bogdle init started')

  // set env
  Bogdle.env = document.location.hostname == BOGDLE_ENV_PROD_URL ? 'prod' : 'local'

  // disable lookup
  Bogdle.dom.interactive.btnGuessLookup.disabled = true

  // if local dev, show debug stuff
  if (Bogdle.env == 'local') {
    Bogdle._initDebug()

    document.title = '(LH) ' + document.title
  }

  if (Bogdle.__getGameMode == 'daily') {
    Bogdle.dom.interactive.difficultyContainer.classList.remove('show')
  }

  Bogdle._initAudio()

  // attach event listeners to DOM elements
  Bogdle._attachEventListeners()

  // load localStorage game state
  Bogdle._loadGameState()

  // console.log('Bogdle has been initialized!')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// load state/statistics from LS -> code model
Bogdle._loadGameState = async function() {
  if (Bogdle.__getGameMode() == 'daily') {
    /* ********************* */
    /* load daily game state */
    /* ********************* */

    const lsStateDaily = JSON.parse(localStorage.getItem(BOGDLE_STATE_DAILY_KEY))

    if (lsStateDaily) {
      console.log('DAILY localStorage state key found and loading...', lsStateDaily)

      Bogdle.state.daily.gameState = lsStateDaily.gameState
      Bogdle.state.daily.guessedWords = lsStateDaily.guessedWords
      Bogdle.state.daily.lastCompletedTime = lsStateDaily.lastCompletedTime
      Bogdle.state.daily.lastPlayedTime = lsStateDaily.lastPlayedTime
      Bogdle.state.daily.seedWord = lsStateDaily.seedWord
      Bogdle.state.daily.statistics = {
        "gamesPlayed": lsStateDaily.statistics.gamesPlayed,
        "wordsFound": lsStateDaily.statistics.wordsFound
      }

      console.log('DAILY localStorage state key loaded; solution to be created with previous seedWord')

      // load a solution based on localStorage seedWord
      await Bogdle._loadExistingSolutionSet('daily', Bogdle.state.daily.seedWord)

      console.log('DAILY localStorage state key loaded!', Bogdle.state.daily)
    } else {
      console.log('DAILY localStorage state key NOT found; defaults kept')
      console.log('DAILY solution to be created with daily word hash')

      // create a new solution based with the daily word hash
      await Bogdle._createNewSolutionSet('daily')
    }

    if (Bogdle.state.daily.lastPlayedTime == null) {
      modalOpen('start')
    }

    console.log('DAILY solutionSet loaded!', Bogdle.state.daily.seedWord.toUpperCase())
  } else {
    /* ********************* */
    /* load free game state  */
    /* ********************* */

    const lsStateFree = JSON.parse(localStorage.getItem(BOGDLE_STATE_FREE_KEY))

    if (lsStateFree) {
      console.log('FREE localStorage state key found and loading...', lsStateFree)

      Bogdle.state.free.difficulty = lsStateFree.difficulty
      Bogdle.state.free.gameState = lsStateFree.gameState
      Bogdle.state.free.guessedWords = lsStateFree.guessedWords
      Bogdle.state.free.lastCompletedTime = lsStateFree.lastCompletedTime
      Bogdle.state.free.lastPlayedTime = lsStateFree.lastPlayedTime
      Bogdle.state.free.seedWord = lsStateFree.seedWord
      Bogdle.state.free.statistics = {
        "gamesPlayed": lsStateFree.statistics.gamesPlayed,
        "wordsFound": lsStateFree.statistics.gamesPlayed
      }

      console.log('FREE localStorage state key loaded; solution to be created with previous seedWord')

      // load a solution based on localStorage seedWord
      await Bogdle._loadExistingSolutionSet('free', Bogdle.state.free.seedWord)

      console.log('FREE localStorage key loaded!', Bogdle.state.free)
    } else {
      console.log('FREE localStorage key NOT found; defaults kept')
      console.log('FREE solution to be created with randomly-chosen word')

      // create a new solution based with a randomly-chosen word
      await Bogdle._createNewSolutionSet('free')
    }

    console.log('FREE solutionSet loaded!', Bogdle.state.free.seedWord.toUpperCase())
  }

  /* ********************* */
  /* load global settings  */
  /* ********************* */

  Bogdle._loadSettings()

  /* ********************* */
  /* save game state->LS   */
  /* ********************* */

  Bogdle._saveGameState()
}

// save game state/settings from code model -> LS
Bogdle._saveGameState = function() {
  // console.log('saving game state and global settings to localStorage...')

  // save daily game state
  try {
    localStorage.setItem(BOGDLE_STATE_DAILY_KEY, JSON.stringify(Bogdle.state.daily))

    // console.log('DAILY localStorage state saved!', JSON.parse(localStorage.getItem(BOGDLE_STATE_DAILY_KEY)))
  } catch(error) {
    console.error('localStorage DAILY state save failed', error)
  }

  // save free game state
  try {
    localStorage.setItem(BOGDLE_STATE_FREE_KEY, JSON.stringify(Bogdle.state.free))

    // console.log('FREE localStorage state saved!', JSON.parse(localStorage.getItem(BOGDLE_STATE_FREE_KEY)))
  } catch(error) {
    console.error('localStorage FREE state save failed', error)
  }

  // save global game settings
  try {
    localStorage.setItem(BOGDLE_SETTINGS_KEY, JSON.stringify(Bogdle.settings))

    // console.log('localStorage settings saved!', JSON.parse(localStorage.getItem(BOGDLE_SETTINGS_KEY)))
  } catch(error) {
    console.error('localStorage global settings save failed', error)
  }
}

// load settings (gear icon) from localStorage
Bogdle._loadSettings = function() {
  // console.log('loading global settings from LS...')

  // STATE->GAMEMODE
  if (Bogdle.settings.gameMode == 'free') {
    Bogdle.dom.interactive.difficultyContainer.classList.add('show')
  }

  // STATE->FREE->DIFFICULTY
  if (localStorage.getItem(BOGDLE_STATE_FREE_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(BOGDLE_STATE_FREE_KEY))

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
  if (localStorage.getItem(BOGDLE_SETTINGS_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(BOGDLE_SETTINGS_KEY))

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
  }

  // console.log('loaded global settings from LS!', Bogdle.settings)
}
// change a setting (gear icon or difficulty) value
Bogdle._changeSetting = async function(setting, value, event) {
  switch (setting) {
    case 'gameMode':
      switch (value) {
        case 'daily':
          console.log('**** switchING game mode to DAILY ****')

          // get seedWord for today
          if (!Bogdle.state.daily.seedWord) {
            try {
              const response = await fetch('scripts/daily.php')
              Bogdle.state.daily.seedWord = await response.text()
            } catch (e) {
              console.error('could not get daily word', e)
            }
          }

          Bogdle._saveSetting('gameMode', 'daily')
          Bogdle._clearHint()

          Bogdle.dom.interactive.btnCreateNew.disabled = true

          // set dom status
          Bogdle.dom.interactive.gameModeDailyLink.dataset.active = true
          Bogdle.dom.interactive.gameModeFreeLink.dataset.active = false
          Bogdle.dom.interactive.difficultyContainer.classList.remove('show')

          await Bogdle._loadExistingSolutionSet('daily', Bogdle.state.daily.seedWord)

          console.log('**** switchED game mode to DAILY ****')
          // console.log(`DAILY seed word for ${Bogdle.__getTodaysDate()}:`, seedWord.toUpperCase())

          break

        case 'free':
          console.log('**** switchING game mode to FREE ****')

          Bogdle._saveSetting('gameMode', 'free')
          Bogdle._clearHint()

          Bogdle.dom.interactive.btnCreateNew.disabled = false

          // set dom status
          Bogdle.dom.interactive.gameModeDailyLink.dataset.active = false
          Bogdle.dom.interactive.gameModeFreeLink.dataset.active = true
          Bogdle.dom.interactive.difficultyContainer.classList.add('show')

          await Bogdle._loadExistingSolutionSet('free', Bogdle.state.free.seedWord)

          console.log('**** switched game mode to FREE ****')
          // console.log(`FREE seed word:`, Bogdle.state.free.seedWord.toUpperCase())

          break
      }

      break
    case 'difficulty':
      var gameMode = 'free'
      var oldDiff = Bogdle.state[gameMode].difficulty
      var newDiff = event.target.dataset.diffid

      // don't prompt unless new difficulty
      if (newDiff != oldDiff) {
        // make sure user wants to change difficulty, as it loses all progress
        var mySubConfirm = new Modal('confirm', 'Change difficulty?',
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
            document.getElementById(event.target.id).dataset.active = true

            Bogdle._clearHint()

            // start a new game with newDiff (but using current seedWord)
            await Bogdle._loadExistingSolutionSet('free', Bogdle.config['free'].seedWord, true)
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

        Bogdle._saveSetting('darkMode', true)
      } else {
        document.getElementById('button-setting-dark-mode').dataset.status = 'false'
        document.body.classList.remove('dark-mode')

        Bogdle._saveSetting('darkMode', false)
      }

      break
    case 'noisy':
      var st = document.getElementById('button-setting-noisy').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-noisy').dataset.status = 'true'

        Bogdle._saveSetting('noisy', true)
      } else {
        document.getElementById('button-setting-noisy').dataset.status = 'false'

        Bogdle._saveSetting('noisy', false)
      }

      break
  }
}
// save a setting (gear icon) to localStorage
Bogdle._saveSetting = function(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  var settings = JSON.parse(localStorage.getItem(BOGDLE_SETTINGS_KEY))

  // console.log('current settings', settings)

  // set temp obj that will go to LS
  settings[setting] = value
  // set internal code model
  Bogdle.settings[setting] = value

  localStorage.setItem(BOGDLE_SETTINGS_KEY, JSON.stringify(settings))

  // console.log('localStorage setting saved!', Bogdle.settings)
}


// add debug stuff if local
Bogdle._initDebug = function() {
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
Bogdle._initAudio = async function() {
  caches.open(BOGDLE_CACHE_AUDIO_KEY).then(cache => {
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

// initialize seedWordsFile to pull initial seedWord from
Bogdle._initSeedWordsFile = function(gameMode) {
  // console.log('initializing seedWordsFile:', gameMode)

  Bogdle.config[gameMode].seedWordsFile = './assets/json/'

  // currently, this loads the same word source every time,
  // but future iterations may actually switch
  if (gameMode == 'free') {
    Bogdle.config[gameMode].seedWordsFile += BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY[Bogdle.state[gameMode].difficulty]]
  } else { // 'daily' is always 'normal' difficulty
    Bogdle.config[gameMode].seedWordsFile += BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY['normal']]
  }

  Bogdle.config[gameMode].seedWordsFile += `/words_9-9.json`

  // console.log(`Bogdle.config[${gameMode}].seedWordsFile`, Bogdle.config[gameMode].seedWordsFile)
}

// initialize dictionary to find words for solutionSet
Bogdle._initDictionaryFile = function(gameMode) {
  // console.log('initializing dictionary file:', gameMode)

  Bogdle.config[gameMode].dictionary = './assets/json/'

  if (gameMode == 'free') {
    Bogdle.config[gameMode].dictionary += `${BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY[Bogdle.state[gameMode].difficulty]]}`
  } else { // 'daily' is always 'normal' difficulty
    Bogdle.config[gameMode].dictionary += `${BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY['normal']]}`
  }

  Bogdle.config[gameMode].dictionary += `/words_3-${Bogdle.__getMaxWordLength()}.json`
}

// create new solutionSet, which resets progress
Bogdle._createNewSolutionSet = async function(gameMode, newWord = null) {
  console.log(`**** creatING new '${gameMode}' solutionSet ****`)

  // set config to defaults
  Bogdle.config[gameMode].letters = []
  Bogdle.config[gameMode].tilesSelected = []

  if (gameMode == 'free') {
    switch (BOGDLE_DIFF_TO_LENGTH[parseInt(Bogdle.difficulty)]) {
      case 3: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_3; break
      case 5: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_5; break
      case 7: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_7; break
      case 9:
      default:
        Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET; break
    }
  } else {
    Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET
  }

  // set state to defaults
  Bogdle.state[gameMode].gameState = 'IN_PROGRESS'
  Bogdle.state[gameMode].guessedWords = []
  Bogdle.state[gameMode].lastCompletedTime = null
  Bogdle.state[gameMode].lastPlayedTime = null

  if (gameMode == 'free') {
    if (!Bogdle.state.free.difficulty) {
      Bogdle.state.free.difficulty = 'normal'
    }
  }

  // initialize appropriate dictionary and seed words files
  Bogdle._initDictionaryFile(gameMode)
  Bogdle._initSeedWordsFile(gameMode)

  // get seed word
  if (gameMode == 'free') {
    if (!newWord) {
      try {
        newWord = await Bogdle.__getNewSeedWord()

        console.log(`_createNewSolutionSet with 'random' seed word '${newWord.toUpperCase()}'...`)
      } catch (err) {
        console.error('could not get new seed word', err)
      }
    }
  } else { // 'daily' always uses day hash
    try {
      const response = await fetch('scripts/daily.php')
      newWord = await response.text()

      if (newWord) {
        console.log(`Seed word for ${Bogdle.__getTodaysDate()}:`, newWord.toUpperCase())
      } else {
        console.error('daily word went bork', newWord)
      }
    } catch (e) {
      console.error('could not get daily seed word', e)
    }
  }

  // set gameMode's state seedWord
  console.log(`_createNewSolutionSet '${gameMode}' seedWord`, newWord.toUpperCase())
  Bogdle.state[gameMode].seedWord = newWord

  // create Findle/Bogdle solutionSet
  try {
    const findle = await Bogdle.__createFindle(
      Bogdle.state[gameMode].seedWord,
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

      // get a range of object keys from 3..Bogdle.__getMaxWordLength()
      const categories = Array.from({length: Bogdle.__getMaxWordLength() - 2}, (x, i) => (i + 3).toString());

      // zero them all out because setting it to the EMPTY_OBJ_SET does not work :'(
      categories.forEach(category => {
        Bogdle.config[gameMode].solutionSet[category] = {}
      })

      // create bogdle's solutionSet
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (key <= Bogdle.__getMaxWordLength()) {
            if (!Bogdle.config[gameMode].solutionSet[key.toString()][word]) {
              Bogdle.config[gameMode].solutionSet[key.toString()][word] = {}
            }

            Bogdle.config[gameMode].solutionSet[key.toString()][word] = 0
          }
        })
      })

      // set tile letter tracking
      Bogdle.config[gameMode].letters = newWord.split('')

      // set score
      Bogdle._setScore(0)

      // choose letters randomly from solutionSet
      Bogdle._shuffleTiles()

      console.log(`**** creatED new '${gameMode}' solutionSet ****`)
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// load existing solutionSet, which retains past progress
Bogdle._loadExistingSolutionSet = async function(gameMode, newWord = null, isNewDiff = false) {
  console.log(`**** loadING existing '${gameMode}' solutionSet ****`)

  // set config to defaults
  Bogdle.config[gameMode].letters = []
  Bogdle.config[gameMode].tilesSelected = []

  // grab appropriate EMPTY_OBJ_SET
  if (gameMode == 'free') {
    switch (Bogdle.__getMaxWordLength()) {
      case 3: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_3; break
      case 5: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_5; break
      case 7: Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET_7; break
      case 9:
      default:
        Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET; break
    }
  } else {
    Bogdle.config[gameMode].solutionSet = EMPTY_OBJ_SET
  }

  // initialize appropriate dictionary and seed words files
  Bogdle._initDictionaryFile(gameMode)
  Bogdle._initSeedWordsFile(gameMode)

  // new game with static seed word
  if (gameMode == 'free') {
    if (!newWord) {
      try {
        newWord = await Bogdle.__getNewSeedWord()

        console.log(`_loadExistingSolutionSet with 'random' seed word '${newWord.toUpperCase()}'...`)
      } catch (err) {
        console.error('could not get new seed word', err)
      }
    }
  } else { // 'daily' always uses day hash
    try {
      const response = await fetch('scripts/daily.php')
      newWord = await response.text()

      if (newWord) {
        console.log(`DAILY seed word for ${Bogdle.__getTodaysDate()}:`, newWord.toUpperCase())
      } else {
        console.error('daily word went bork', newWord)
      }
    } catch (e) {
      console.error('could not get daily seed word', e)
    }
  }

  // set gameMode's state seedWord
  console.log(`_loadExistingSolutionSet '${gameMode}' seedWord`, newWord.toUpperCase())
  Bogdle.state[gameMode].seedWord = newWord

  // load existing solutionSet
  try {
    const findle = await Bogdle.__createFindle(
      Bogdle.state[gameMode].seedWord,
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

      // get a range of object keys from 3..Bogdle.__getMaxWordLength()
      const categories = Array.from({length: Bogdle.__getMaxWordLength() - 2}, (x, i) => (i + 3).toString());
      const solutionSet = Bogdle.config[gameMode].solutionSet

      // zero them all out because setting it to the EMPTY_OBJ_SET does not work :'(
      categories.forEach(category => {
        Bogdle.config[gameMode].solutionSet[category] = {}
      })

      // re-create bogdle's solutionSet
      Object.keys(findle).forEach(key => {
        findle[key].forEach(word => {
          if (key <= Bogdle.__getMaxWordLength()) {
            if (!solutionSet[key.toString()][word]) {
              Bogdle.config[gameMode].solutionSet[key.toString()][word] = {}
            }

            Bogdle.config[gameMode].solutionSet[key.toString()][word] = 0
          }
        })
      })

      // set tile letter tracking
      Bogdle.config[gameMode].letters = newWord.split('')

      // if just changing FREE difficulty, clear guessedWords
      if (isNewDiff) {
        Bogdle.state['free'].guessedWords = []
        Bogdle._setScore(0)
        Bogdle._saveGameState()
      } // else check for pre-guessed words
      else {
        let lsConfig = null

        if (Bogdle.__getGameMode() == 'daily') {
          lsConfig = JSON.parse(localStorage.getItem(BOGDLE_STATE_DAILY_KEY))
        } else {
          lsConfig = JSON.parse(localStorage.getItem(BOGDLE_STATE_FREE_KEY))
        }

        Bogdle.state[gameMode].guessedWords = []

        // console.log(`checking for '${gameMode}' pre-guessed words...`, lsConfig.guessedWords)

        if (lsConfig.guessedWords && lsConfig.guessedWords.length) {
          // console.log('found some pre-guessed words, so adding to code')

          lsConfig.guessedWords.forEach(word => {
            Bogdle.state[gameMode].guessedWords.push(word)
            Bogdle.config[gameMode].solutionSet[word.length][word] = 1
          })

          // console.log('loaded existing solutionSet and checked off pre-guessed words', Bogdle.config[gameMode].solutionSet)

          // set score to existing number of guessedWords
          Bogdle._setScore(Bogdle.state[gameMode].guessedWords.length)
        } else {
          // set score back to 0
          // console.log('found no pre-guessed words')
          Bogdle._setScore(0)
        }
      }

      // shuffle tiles randomly
      Bogdle._shuffleTiles()

      console.log(`**** loadED existing '${gameMode}' solutionSet ****`)
    }
  } catch (err) {
    console.error('could not create new solution', err)
  }
}

// ask to create new free gamemode puzzle
Bogdle._confirmFreeCreateNew = async function() {
  const myConfirm = new Modal('confirm', 'Create New Puzzle?',
    'Are you <strong>sure</strong> you want to create a new puzzle?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    var confirmed = await myConfirm.question()

    if (confirmed) {
      Bogdle._resetFreeProgress()
      Bogdle._createNewSolutionSet('free')
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// reset config and LS for free play
Bogdle._resetFreeProgress = async function() {
  // console.log('resetting free play progress...')

  // set config to defaults
  Bogdle.state[Bogdle.__getGameMode()] = {
    "difficulty": Bogdle.state[Bogdle.__getGameMode()].difficulty,
    "gameState": "IN_PROGRESS",
    "guessedWords": [],
    "lastCompletedTime": null,
    "lastPlayedTime": null,
    "statistics": {
      "gamesPlayed": 0,
      "wordsFound": 0
    }
  }

  Bogdle.config[Bogdle.__getGameMode()].dictionary = `./assets/json/${BOGDLE_WORD_SOURCES[BOGDLE_DIFFICULTY[Bogdle.state[Bogdle.__getGameMode()].difficulty]]}/words_3-${Bogdle.__getMaxWordLength()}.json`

  // save those defaults to localStorage
  Bogdle._saveGameState()

  // set score to 0
  Bogdle._setScore(0)

  // re-enable DOM inputs
  Bogdle._resetInput()

  // choose letters randomly from solutionSet
  Bogdle._shuffleTiles()

  // open the help modal
  // Bogdle.modalOpen('start')
}

// submit a guess
Bogdle._submitWord = function(word) {
  // console.log('submitting word...', word)

  if (Bogdle.state[Bogdle.__getGameMode()].gameState == 'IN_PROGRESS') {
    if (word.length > 2) {
      if (typeof Bogdle.config[Bogdle.__getGameMode()].solutionSet[word.length][word] != 'undefined') {
        if (Bogdle.config[Bogdle.__getGameMode()].solutionSet[word.length][word] !== 1) {

          if (word.length == Bogdle.__getMaxWordLength()) {
            Bogdle.audioPlay(`doo-dah-doo`)
          } else {
            // choose haaahs[1-3] at random and play
            var num = Math.floor(Math.random() * 3) + 1
            Bogdle.audioPlay(`haaahs${num}`)
          }

          if (!Bogdle.state[Bogdle.__getGameMode()].guessedWords) {
            Bogdle.state[Bogdle.__getGameMode()].guessedWords = []
          }

          Bogdle.state[Bogdle.__getGameMode()].guessedWords.push(word)
          Bogdle.state[Bogdle.__getGameMode()].guessedWords.sort()
          Bogdle.state[Bogdle.__getGameMode()].lastPlayedTime = new Date().getTime()
          Bogdle.state[Bogdle.__getGameMode()].statistics.wordsFound += 1

          Bogdle.config[Bogdle.__getGameMode()].solutionSet[word.length][word] = 1

          Bogdle.dom.guess.classList.remove('first-guess')

          // do a dance
          Bogdle.animateCSS('#guess', 'tada')

          // clear hint if it's the same word
          if (word == Bogdle.config[Bogdle.__getGameMode()].hintWord) {
            Bogdle._clearHint()
          }

          Bogdle._saveGameState()

          Bogdle._increaseScore()

          Bogdle._checkWinState()
        } else {
          modalOpen('repeated-word', true, true)
          Bogdle.animateCSS('#guess', 'headShake')
        }
      } else {
        modalOpen('invalid-word', true, true)
        Bogdle.animateCSS('#guess', 'headShake')
      }
    } else {
      modalOpen('invalid-length', true, true)
      Bogdle.animateCSS('#guess', 'headShake')
    }
  } else {
    // game is over, so no more guessed allowed
    // console.error('current game is over; no more guesses!')
  }
}

// increase score
Bogdle._increaseScore = function() {
  // get current score as an integer
  var curGuessed = parseInt(Bogdle.dom.scoreGuessed.innerHTML)
  // increase and convert back to string
  Bogdle.dom.scoreGuessed.innerHTML = (curGuessed + 1).toString()
}
// set score
Bogdle._setScore = function(guessed = 0) {
  // console.log('setting score...')

  // set UI elements
  Bogdle.dom.scoreGuessed.innerHTML = guessed.toString()
  Bogdle.dom.scoreGuessedOf.innerHTML = ' of '
  Bogdle.dom.scoreTotal.innerHTML = Bogdle.__getSolutionSize().toString()
  Bogdle.dom.scoreTotalWords.innerHTML = ' words'

  // console.log('score set!', `${Bogdle.dom.score.innerHTML}`)
}

// game state checking
Bogdle._checkGuess = function() {
  // reset classes
  Bogdle.dom.guess.classList.remove('valid', 'first-guess')
  Bogdle.dom.interactive.btnGuessLookup.disabled = true

  // player entered valid word length
  if (Bogdle.dom.guess.innerHTML.length > 2) {
    var word = Bogdle.dom.guess.innerHTML.trim()

    // player guessed a valid word
    Object.keys(Bogdle.config[Bogdle.__getGameMode()].solutionSet).forEach(key => {
      if (parseInt(key) <= Bogdle.__getMaxWordLength()) {
        if (Object.keys(Bogdle.config[Bogdle.__getGameMode()].solutionSet[key]).includes(word)) {
          Bogdle.dom.guess.classList.toggle('valid')
          Bogdle.dom.interactive.btnGuessLookup.disabled = false

          // and it's the first time
          if (!Bogdle.config[Bogdle.__getGameMode()].solutionSet[key][word]) {
            Bogdle.dom.guess.classList.add('first-guess')
            Bogdle.animateCSS('#guess', 'pulse')
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
Bogdle._checkWinState = function() {
  // console.log('checking for win state...')

  if (Bogdle.config[Bogdle.__getGameMode()].solutionSet) {
    if (Object.values(Bogdle.config[Bogdle.__getGameMode()].solutionSet).every((val) => val == 1)) {
      // console.log('Bogdle._checkWinState(): game won!', Bogdle.config[Bogdle.__getGameMode()].solutionSet)

      if (Bogdle.state[Bogdle.__getGameMode()].gameState == 'IN_PROGRESS') {
        Bogdle.state[Bogdle.__getGameMode()].statistics.gamesPlayed += 1
      }

      // display modal win thingy
      modalOpen('win')

      // set config stuff
      Bogdle.state[Bogdle.__getGameMode()].gameState = 'GAME_OVER'

      if (Bogdle.state[Bogdle.__getGameMode()].lastCompletedTime == null) {
        Bogdle.state[Bogdle.__getGameMode()].lastCompletedTime = new Date().getTime()
      }

      Bogdle._saveGameState()

      // disable inputs (until future daily re-enabling)
      Bogdle._disableTiles()

      return true
    } else {
      // console.log('Bogdle._checkWinState(): game still in progress')
      return false
    }
  } else {
    return false
  }
}

// reset UI tiles to default state
Bogdle._resetInput = function() {
  Bogdle._resetTiles()

  Bogdle._resetGuess()
}
// set all tiles back to 'tbd'
Bogdle._resetTiles = function() {
  Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
}
// blank out the current DOM guess div
Bogdle._resetGuess = function() {
  Bogdle.dom.guess.innerHTML = ''
  Bogdle.dom.guess.classList.remove('valid')
  Bogdle.dom.interactive.btnGuessLookup.disabled = true
}

// disable all UI tiles
Bogdle._disableTiles = function() {
  Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
    tile.setAttribute('disabled', '')
    tile.dataset.state = 'disabled'
  })
}
// randomize the order of tiles
Bogdle._shuffleTiles = function() {
  let letters = Bogdle.config[Bogdle.__getGameMode()].letters

  // console.log('shuffling letters', letters)

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
  Bogdle._resetInput()
}

// remove last letter in DOM guess div
Bogdle._removeLastLetter = function() {
  if (Bogdle.state[Bogdle.__getGameMode()].gameState == 'IN_PROGRESS') {
    // remove last position from selected array
    if (Bogdle.config[Bogdle.__getGameMode()].tilesSelected.length) {
      var last = Bogdle.config[Bogdle.__getGameMode()].tilesSelected.pop()

      Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
        if (tile.dataset.pos == last) {
          tile.dataset.state = 'tbd'
        }
      })
    }

    // remove last letter of active guess
    if (Bogdle.dom.guess.innerHTML.length) {
      Bogdle.dom.guess.innerHTML = Bogdle.dom.guess.innerHTML.slice(0, Bogdle.dom.guess.innerHTML.length - 1)

      Bogdle.audioPlay('tile_delete')

      Bogdle._checkGuess()
    }
  }
}

// dynamically resize board depending on viewport
Bogdle._resizeBoard = function() {
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
Bogdle._onTileClick = function(tile) {
  const tileStatus = tile.target.dataset.state

  if (tileStatus == 'tbd') {
    Bogdle.animateCSS(`#${tile.target.id}`, 'pulse')

    // change tile status
    tile.target.dataset.state = 'selected'

    // push another selected tile onto selected array
    Bogdle.config[Bogdle.__getGameMode()].tilesSelected.push(tile.target.dataset.pos)

    // add selected tile to guess
    Bogdle.dom.guess.innerHTML += tile.target.innerHTML

    Bogdle.audioPlay('tile_click')

    // check guess for validity
    Bogdle._checkGuess()
  }
}

// modal: show how many words have been guessed
Bogdle._displayGameProgress = function() {
  var html = ''

  if (Bogdle.__getGameMode() == 'free') {
    html += `<h6>difficulty: ${Bogdle.state[Bogdle.__getGameMode()].difficulty}</h6>`
  }

  html += '<ul>'

  // check each length category (max...3, etc.)
  // total up words guessed in each
  Object.keys(Bogdle.config[Bogdle.__getGameMode()].solutionSet).reverse().forEach(category => {
    if (parseInt(category) <= Bogdle.__getMaxWordLength()) {
      html += `<li><span class="solution-category">${category}-LETTER</span>`

      var categoryEntries = Object.entries(Bogdle.config[Bogdle.__getGameMode()].solutionSet[category])
      var categoryGuessed = categoryEntries
        .filter(entry => entry[1])

      categoryLength = Object.keys(Bogdle.config[Bogdle.__getGameMode()].solutionSet[category])
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

// modal: debug: display Bogdle.config
Bogdle._displayGameConfig = function() {
  let configs = Bogdle.config

  var html = ''

  html += `<h3>GLOBAL (ENV: ${Bogdle.env})</h3>`
  html += '<h3>----------------------------</h3>'

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
              value = Bogdle.__getFormattedDate(new Date(value))
            }

            if (Object.keys(value)) {
              // console.log('found another object', key, label, value)
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
            value = Bogdle.__getFormattedDate(new Date(value))
          }
        }

        // special cases
        if (label == 'hintWord') {
          html += `<dd><code>${label}:</code></dd><dt>${value ? value.toUpperCase() : value}</dt>`
        } else if (label == 'hintObscuredWord' || label == 'letters') {
          html += `<dd><code>${label}:</code></dd><dt>${value ? value.map(v => v.toUpperCase()).join(', ') : value}</dt>`
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })
  })

  html += '</dl>'

  return html
}
// modal: debug: display Bogdle.state
Bogdle._displayGameState = function() {
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
              value = Bogdle.__getFormattedDate(new Date(value))
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

        // special cases
        if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
          if (value) {
            value = Bogdle.__getFormattedDate(new Date(value))
          }
        } else if (label == 'guessedWords') {
          html += `<dd><code>${label}:</code></dd><dt>`
          html += `${value ? value.map(v => v.toUpperCase()).join(', ') : value}</dt>`
        } else if (label == 'seedWord') {
          html += `<dd><code>${label}:</code></dd><dt>${value ? value.toUpperCase() : value}</dt>`
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })
  })

  html += '</dl>'

  return html
}
// modal: debug: display words in both gameMode solutions
Bogdle._displayGameSolution = function() {
  let html = ''

  // display DAILY solution
  html += `<h3>Game Mode: DAILY</h3>`
  html += '<ul>'

  // check each length category (max...3, etc.)
  Object.keys(Bogdle.config.daily.solutionSet).reverse().forEach(key => {
    var dailyWords = []

    html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

    // create sorted array of each length category's words
    var sortedArr = Array.from(Object.keys(Bogdle.config.daily.solutionSet[key])).sort()

    // go through each word in each category
    sortedArr.forEach(word => {
      // mark guessed words
      if (Bogdle.state[Bogdle.__getGameMode()].guessedWords.includes(word)) {
        word = `<strong>${word}</strong>`
      }
      dailyWords.push(word.toUpperCase())
    })

    // add all the words to the markup
    html += dailyWords.join(', ')
    html += `</li></ul></li>`
  })

  html += '</ul>'

  // display FREE solution
  html += `<h3>Game Mode: FREE</h3>`
  html += `<h5>difficulty: ${Bogdle.state.free.difficulty}</h5>`

  html += '<ul>'

  // check each length category (max...3, etc.)
  Object.keys(Bogdle.config.free.solutionSet).reverse().forEach(key => {
    if (key <= Bogdle.__getMaxWordLength()) {
      var freeWords = []

      html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

      // create sorted array of each length category's words
      var sortedArr = Array.from(Object.keys(Bogdle.config.free.solutionSet[key])).sort()

      // go through each word in each category
      sortedArr.forEach(word => {
        freeWords.push(word.toUpperCase())
      })

      // add all the words to the markup
      html += freeWords.join(', ')
      html += `</li></ul></li>`
    }
  })

  html += '</ul>'

  return html
}

// initialize hint system when button clicked
Bogdle._initHint = function() {
  // console.log('checking for hintWord...')

  if (!Bogdle.config[Bogdle.__getGameMode()].hintWord) {
    const wordsLeft = Bogdle.__getUnGuessedWords()
    Bogdle.config[Bogdle.__getGameMode()].hintWord = wordsLeft[Math.floor(Math.random() * wordsLeft.length)]

    // console.log('hintWord created:', Bogdle.config[Bogdle.__getGameMode()].hintWord.toUpperCase())

    Array.from(Bogdle.config[Bogdle.__getGameMode()].hintWord).forEach(l => {
      Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord.push('_')
    })

    Bogdle.dom.interactive.btnHintReset.classList.add('show')

    // console.log('hintObscuredWord reset:', Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord.join(' ').toUpperCase())
  } else {
    // console.log('hintWord already existing:', Bogdle.config[Bogdle.__getGameMode()].hintWord.toUpperCase())
  }

  Bogdle._cycleHint()
}
// continually add letters to hint until max reached
Bogdle._cycleHint = function() {
  // console.log('cycling hintWord status...')

  const hintWord = Bogdle.config[Bogdle.__getGameMode()].hintWord

  // set maximum number of letters to show before forcing a new hint
  var maxLetters = Math.floor(hintWord.length / 2)

  // if word is short, add more potential hint letters
  if (hintWord.length < 4) {
    maxLetters += 1
  }

  // console.log(`length: ${hintWord.length}, maxLetters: ${maxLetters}, count: ${Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter}`)

  // if we haven't yet revealed enough letters,
  // change a _ to a letter
  if (Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter < maxLetters) {
    let idx = 0
    let foundEmpty = false

    while (!foundEmpty) {
      idx = Math.floor(Math.random() * Bogdle.config[Bogdle.__getGameMode()].hintWord.length)

      if (Bogdle.config[Bogdle.__getGameMode()].hintWord[idx]) {
        if (Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord[idx] == '_') {
          Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord[idx] = Bogdle.config[Bogdle.__getGameMode()].hintWord[idx];
          foundEmpty = true
        }
      }
    }

    // console.log('Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord', Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord.join(' ').toUpperCase())

    Bogdle.dom.interactive.btnHint.innerHTML = Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord.join('')

    Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter++
  }

  if (Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter == maxLetters) {
    // console.log('maxLetters reached, no more letters')

    Bogdle.dom.interactive.btnHint.classList.add('not-a-button')
    Bogdle.dom.interactive.btnHint.setAttribute('disabled', true)
  }
}
// change not-a-button hint back to button hint
Bogdle._clearHint = function() {
  // console.log('clearing hintWord...')

  Bogdle.dom.interactive.btnHint.classList.remove('not-a-button')
  Bogdle.dom.interactive.btnHint.removeAttribute('disabled')
  Bogdle.dom.interactive.btnHint.innerHTML = 'HINT?'

  Bogdle.dom.interactive.btnHintReset.classList.remove('show')

  Bogdle.config[Bogdle.__getGameMode()].hintWord = null
  Bogdle.config[Bogdle.__getGameMode()].hintObscuredWord = []
  Bogdle.config[Bogdle.__getGameMode()].hintObscuredWordCounter = 0
}

// handle both clicks and touches outside of modals
Bogdle._handleClickTouch = function(event) {
  var dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    var isConfirm = dialog.classList.contains('modal-confirm')

    // only close if not a confirmation!
    if (event.target == dialog && !isConfirm) {
      dialog.remove()
    }
  }

  if (event.target == Bogdle.dom.navOverlay) {
    Bogdle.dom.navOverlay.classList.toggle('show')
  }
}

// add event listeners to DOM
Bogdle._attachEventListeners = function() {
  // {} header icons to open modals
  Bogdle.dom.interactive.btnNav.addEventListener('click', () => {
    Bogdle.dom.navOverlay.classList.toggle('show')
  })
  Bogdle.dom.interactive.btnNavClose.addEventListener('click', () => {
    Bogdle.dom.navOverlay.classList.toggle('show')
  })
  Bogdle.dom.interactive.btnHelp.addEventListener('click', () => modalOpen('help'))
  Bogdle.dom.interactive.btnStats.addEventListener('click', () => modalOpen('stats'))
  Bogdle.dom.interactive.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // [A] tile interaction
  Array.from(Bogdle.dom.interactive.tiles).forEach(tile => {
    tile.addEventListener('click', (t) => {
      Bogdle._onTileClick(t)
    })
  })

  // ❔ hint
  Bogdle.dom.interactive.btnHint.addEventListener('click', () => {
    Bogdle._initHint()
  })

  // X hint reset
  Bogdle.dom.interactive.btnHintReset.addEventListener('click', () => {
    Bogdle._clearHint()
  })

  // ✅ submit word
  Bogdle.dom.interactive.btnSubmit.addEventListener('click', () => {
    Bogdle._submitWord(Bogdle.dom.guess.innerHTML)
  })

  // ⌫ backspace
  Bogdle.dom.interactive.btnBackspace.addEventListener('click', () => {
    Bogdle._removeLastLetter()
  })

  // X clear
  Bogdle.dom.interactive.btnClearGuess.addEventListener('click', () => {
    Bogdle._resetInput()
  })

  // 🔀 shuffle
  Bogdle.dom.interactive.btnShuffle.addEventListener('click', () => {
    Bogdle._shuffleTiles()
  })

  // := show current game word list progress
  Bogdle.dom.interactive.btnShowProgress.addEventListener('click', () => {
    modalOpen('show-progress')
  })

  // + create new solution
  Bogdle.dom.interactive.btnCreateNew.addEventListener('click', () => {
    Bogdle._confirmFreeCreateNew()
  })

  // 📕 dictionary lookup
  Bogdle.dom.interactive.btnGuessLookup.addEventListener('click', () => {
    if (Bogdle.dom.guess.classList.contains('valid')) {
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
      Bogdle._submitWord(Bogdle.dom.guess.innerHTML)
    } else if (event.code == 'Backspace' || event.code == 'Delete') {
      Bogdle._removeLastLetter()
    } else {
      var excludedKeys = ['Alt', 'Control', 'Meta', 'Shift']
      var validLetters = Bogdle.config[Bogdle.__getGameMode()].letters.map(l => l.toUpperCase())
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
            Bogdle.config[Bogdle.__getGameMode()].tilesSelected.push(tileToPush.dataset.pos)

            // add selected tile to guess
            Bogdle.dom.guess.innerHTML += tileToPush.innerHTML

            Bogdle.audioPlay('tile_click')

            // check guess for validity
            Bogdle._checkGuess()
          }
        }
      } else {
        // console.log('a modifier key is being held, so ignore letter', event)
      }
    }
  })

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Bogdle._handleClickTouch)
  window.addEventListener('touchend', Bogdle._handleClickTouch)

  window.onload = Bogdle._resizeBoard
  window.onresize = Bogdle._resizeBoard

  // console.log('added event listeners')
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

Bogdle.__createFindle = async (word, dictionary, config) => {
  // console.log(`creating new Findle for '${word.toUpperCase()}' with ${dictionary} file...`)

  // create new empty Findle instance
  const findleInstance = new Findle(word, dictionary, config)

  // console.log('findleInstance', findleInstance)

  // create a new solution to return
  try {
    await findleInstance.createSolution()
    // return solution
    return findleInstance.solution
  } catch (err) {
    console.error('Findle.createSolution() failed', err)
  }
}


// load random seed word for solutionSet
Bogdle.__getNewSeedWord = async function() {
  // console.log('Bogdle.settings', Bogdle.settings)
  // console.log(`Bogdle.config[${Bogdle.__getGameMode()}]`, Bogdle.config[Bogdle.__getGameMode()])

  const seedWordsFile = Bogdle.config[Bogdle.__getGameMode()].seedWordsFile
  const response = await fetch(seedWordsFile)
  const responseJson = await response.json()

  // random max-length word
  let possibles = responseJson['9']
  let possibleIdx = Math.floor(Math.random() * possibles.length)

  this.seedWord = possibles[possibleIdx]

  return this.seedWord
}

// get array of words not yet guessed for hint system
Bogdle.__getUnGuessedWords = function() {
  var words = Bogdle.config[Bogdle.__getGameMode()].solutionSet
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
Bogdle.__getFormattedDate = function(date) {
  var formatted_date = ''

  formatted_date += `${date.getFullYear()}/`
  formatted_date += `${(date.getMonth() + 1).toString().padStart(2, '0')}/` // months are 0-indexed!
  formatted_date += `${date.getDate().toString().padStart(2, '0')} `
  formatted_date += `${date.getHours().toString().padStart(2, '0')}:`
  formatted_date += `${date.getMinutes().toString().padStart(2, '0')}:`
  formatted_date += `${date.getSeconds().toString().padStart(2, '0')}`

  return formatted_date
}

// return Bogdle.config[Bogdle.__getGameMode()].solutionSet size
Bogdle.__getSolutionSize = function() {
  let categorySize = 0
  let solutionSize = 0

  const solutionSet = Bogdle.config[Bogdle.__getGameMode()].solutionSet

  Object.keys(solutionSet).forEach(category => {
    if (parseInt(category) <= Bogdle.__getMaxWordLength()) {
      categorySize = Object.keys(solutionSet[category]).length
      solutionSize += categorySize
    }
  })

  return solutionSize
}

// helper method to get game difficulty as a max letter length
Bogdle.__getMaxWordLength = function() {
  if (Bogdle.config.gameMode == 'daily') {
    return 9
  }

  let diff = Bogdle.state[Bogdle.__getGameMode()].difficulty

  if (!diff) diff = 'normal'

  return BOGDLE_DIFF_TO_LENGTH[diff]
}

// get displayable string for today's date
Bogdle.__getTodaysDate = function() {
  const d = new Date(Date.now())
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// shorter gameMode deducer
Bogdle.__getGameMode = function() {
  return Bogdle.settings.gameMode
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Bogdle.initApp()
