/* lib/misc/local_storage */
/* functions to interact with window.localStorage */
/* global Bogdle */

// load state from LS -> code model
Bogdle._loadGame = async function () {
  /* ************************* */
  /* settings LS -> code       */
  /* ************************* */

  Bogdle._loadSettings()

  let dailyCreateOrLoad = ''
  let freeCreateOrLoad = ''

  /* ************************* */
  /* daily state LS -> code    */
  /* ************************* */

  const lsStateDaily = JSON.parse(localStorage.getItem(BOGDLE_STATE_DAILY_LS_KEY))

  // if we have previous LS values, sync them to code model
  if (lsStateDaily && Object.keys(lsStateDaily)) {
    const dailyDefaults = BOGDLE_DEFAULTS.state.daily

    let i = 0
    lsStateDaily.forEach((lsState) => {
      Bogdle.__setState('difficulty', lsState.difficulty || dailyDefaults.difficulty, 'daily', i)
      Bogdle.__setState('gameState', lsState.gameState || dailyDefaults.gameState, 'daily', i)
      Bogdle.__setState('gameWon', lsState.gameWon || false, 'daily', i)
      Bogdle.__setState(
        'guessedWords',
        lsState.guessedWords || dailyDefaults.guessedWords,
        'daily',
        i
      )
      Bogdle.__setState('hintsUsed', lsState.hintsUsed || 0, 'daily', i)
      Bogdle.__setState('lastCompletedTime', lsState.lastCompletedTime || null, 'daily', i)
      Bogdle.__setState('lastPlayedTime', lsState.lastPlayedTime || null, 'daily', i)
      Bogdle.__setState('pangramFound', lsState.pangramFound || false, 'daily', i)
      Bogdle.__setState('seedWord', lsState.seedWord || dailyDefaults.seedWord, 'daily', i)

      i++
    })

    // special case for daily word: need to check
    // to make sure time hasn't elapsed on saved progress
    try {
      const response = await fetch(BOGDLE_DAILY_SCRIPT)
      const data = await response.json()
      const dailyWord = data['word']

      // saved word and daily word are the same? still working on it
      // console.log(
      //   `dailyWord: ${dailyWord} == savedSeedword: ${lsStateDaily[Bogdle.__getSessionIndex()].seedWord}?`,
      //   dailyWord == lsStateDaily[Bogdle.__getSessionIndex()].seedWord
      // )
      if (dailyWord == lsStateDaily[Bogdle.__getSessionIndex()].seedWord) {
        Bogdle.__setState('gameState', lsStateDaily[Bogdle.__getSessionIndex()].gameState, 'daily')
        Bogdle.__setState(
          'guessedWords',
          lsStateDaily[Bogdle.__getSessionIndex()].guessedWords,
          'daily'
        )
        Bogdle.__setState('seedWord', lsStateDaily[Bogdle.__getSessionIndex()].seedWord, 'daily')

        dailyCreateOrLoad = 'load'
      }
      // time has elapsed on daily puzzle, and new one is needed
      else {
        Bogdle.__setState('gameState', 'IN_PROGRESS', 'daily')
        Bogdle.__setState('guessedWords', [], 'daily')

        Bogdle._saveGame('daily')

        dailyCreateOrLoad = 'create'
      }

      Bogdle.__updateDailyDetails(data['index'])
    } catch (e) {
      console.error('could not get daily seed word', e)
    }
  } else {
    dailyCreateOrLoad = 'create'
  }

  /* ************************* */
  /* free state LS -> code     */
  /* ************************* */

  const lsStateFree = JSON.parse(localStorage.getItem(BOGDLE_STATE_FREE_LS_KEY))

  // if we have previous LS values, sync them to code model
  if (lsStateFree && Object.keys(lsStateFree)) {
    const freeDefaults = BOGDLE_DEFAULTS.state.free

    let i = 0
    lsStateFree.forEach((lsState) => {
      Bogdle.__setState('difficulty', lsState.difficulty || freeDefaults.difficulty, 'free', i)

      Bogdle.dom.interactive.difficultyContainerLinks.forEach((link) => {
        link.dataset.active = false
      })
      document.getElementById(`diff-${Bogdle.__getState().difficulty}`).dataset.active = true

      Bogdle.__setState('gameState', lsState.gameState || freeDefaults.gameState, 'free', i)
      Bogdle.__setState('gameWon', lsState.gameWon || false, 'free', i)
      Bogdle.__setState(
        'guessedWords',
        lsState.guessedWords || freeDefaults.guessedWords,
        'free',
        i
      )
      Bogdle.__setState('hintsUsed', lsState.hintsUsed || 0, 'free', i)
      Bogdle.__setState('lastCompletedTime', lsState.lastCompletedTime || null, 'free', i)
      Bogdle.__setState('lastPlayedTime', lsState.lastPlayedTime || null, 'free', i)
      Bogdle.__setState('pangramFound', lsState.pangramFound || false, 'free', i)
      Bogdle.__setState('seedWord', lsState.seedWord || freeDefaults.seedWord, 'free', i)

      i++
    })

    freeCreateOrLoad = 'load'
  } else {
    freeCreateOrLoad = 'create'
  }

  /* ************************* */
  /* create/load puzzle        */
  /* ************************* */

  if (!Bogdle.settings.gameMode) {
    Bogdle.settings.gameMode = BOGDLE_DEFAULT_GAMEMODE
  }

  // daily load/create
  if (Bogdle.__getGameMode() == 'daily') {
    Bogdle.dom.interactive.difficultyContainer.classList.remove('show')
    Bogdle.dom.dailyDetails.classList.add('show')

    if (dailyCreateOrLoad == 'load') {
      await Bogdle._loadExistingSolutionSet('daily', Bogdle.__getState('daily').seedWord)

      Bogdle._logStatus('[LOADED] /app/game(daily)')
    } else {
      await Bogdle._createNewSolutionSet('daily')

      Bogdle._logStatus('[CREATED] /app/game(daily)')
    }
  }
  // free load/create
  else {
    if (freeCreateOrLoad == 'load') {
      await Bogdle._loadExistingSolutionSet('free', Bogdle.__getState('free').seedWord)

      Bogdle._logStatus('[LOADED] /app/game(daily)')
    } else {
      await Bogdle._createNewSolutionSet('free')

      Bogdle._logStatus('[CREATED] /app/game(daily)')
    }
  }

  if (Bogdle.settings.firstTime && document.referrer.indexOf('omni.neb.host') < 0) {
    Bogdle.modalOpen('start')
  }
}
// save state from code model -> LS
Bogdle._saveGame = function (lsType, src = 'unknown') {
  switch (lsType) {
    case 'daily':
      let curDailyState = Bogdle.__getStateObj('daily')

      curDailyState.forEach((sesh) => {
        Object.keys(sesh).forEach((key) => {
          if (sesh[key] === undefined) {
            sesh[key] = null
          }
        })
      })

      localStorage.setItem(BOGDLE_STATE_DAILY_LS_KEY, JSON.stringify(curDailyState))

      break

    case 'free':
      let curFreeState = Bogdle.__getStateObj('free')

      curFreeState.forEach((sesh) => {
        Object.keys(sesh).forEach((key) => {
          if (sesh[key] === undefined) {
            sesh[key] = null
          }
        })
      })

      localStorage.setItem(BOGDLE_STATE_FREE_LS_KEY, JSON.stringify(curFreeState))

      break

    case 'settings':
      localStorage.setItem(BOGDLE_SETTINGS_LS_KEY, JSON.stringify(Bogdle.settings))

      break
  }

  Bogdle._logStatus(`[SAVED] game(${lsType})`, src)
}

// load settings (gear icon) from localStorage
Bogdle._loadSettings = function () {
  const lsSettings = JSON.parse(localStorage.getItem(BOGDLE_SETTINGS_LS_KEY))

  if (lsSettings && Object.keys(lsSettings)) {
    if (lsSettings.clearWord !== undefined) {
      Bogdle.settings.clearWord = lsSettings.clearWord

      if (Bogdle.settings.clearWord) {
        const setting = document.getElementById('button-setting-clear-word')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }

    if (lsSettings.darkMode !== undefined) {
      Bogdle.settings.darkMode = lsSettings.darkMode

      if (Bogdle.settings.darkMode) {
        document.body.classList.add('dark-mode')

        const setting = document.getElementById('button-setting-dark-mode')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }

    if (lsSettings.firstTime !== undefined) {
      Bogdle.settings.firstTime = lsSettings.firstTime
    }

    if (lsSettings.gameMode !== undefined) {
      Bogdle.settings.gameMode = lsSettings.gameMode || 'daily'
    }

    if (lsSettings.noisy !== undefined) {
      Bogdle.settings.noisy = lsSettings.noisy || false

      if (Bogdle.settings.noisy) {
        Bogdle._initAudio()

        const setting = document.getElementById('button-setting-noisy')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }
  } else {
    if (document.referrer.indexOf('omni.neb.host') < 0) {
      Bogdle.modalOpen('start')
    }
  }

  // STATE->GAMEMODE
  if (Bogdle.__getGameMode() == 'free') {
    Bogdle.dom.interactive.gameModeDailyLink.dataset.active = false
    Bogdle.dom.interactive.gameModeFreeLink.dataset.active = true
    Bogdle.dom.interactive.difficultyContainer.classList.add('show')
    Bogdle.dom.dailyDetails.classList.remove('show')
    Bogdle.dom.interactive.btnCreateNew.disabled = false
  }

  // STATE->FREE->DIFFICULTY
  const lsConfigStateFree = JSON.parse(localStorage.getItem(BOGDLE_STATE_FREE_LS_KEY))

  if (lsConfigStateFree) {
    if (lsConfigStateFree.difficulty) {
      Bogdle.dom.interactive.difficultyContainerLinks.forEach(
        (link) => (link.dataset.active = false)
      )

      var setting = document.getElementById(`diff-${lsConfigStateFree.difficulty}`)

      if (setting) {
        setting.dataset.active = true
      }
    }
  }

  Bogdle._logStatus('[LOADED] /app/ls(settings)')
}
// change a setting (gear icon or difficulty) value
// then save to localStorage
Bogdle._changeSetting = async function (setting, value) {
  switch (setting) {
    case 'gameMode':
      // if at end-state and a gameMode is clicked
      // make sure to close the open modal
      Bogdle.ui._removeModalVestige()

      if (Bogdle.__getGameMode() != value) {
        switch (value) {
          case 'daily':
            // get seedWord for today
            if (!Bogdle.__getState('daily').seedWord) {
              try {
                const response = await fetch(BOGDLE_DAILY_SCRIPT)
                const data = await response.json()
                Bogdle.__setState('daily', 'seedWord', data['word'])

                Bogdle.__updateDailyDetails(data['index'])
              } catch (e) {
                console.error('could not get daily word', e)
              }
            }

            Bogdle._saveSetting('gameMode', 'daily')
            Bogdle._clearHint()

            // set dom status
            Bogdle.dom.interactive.gameModeDailyLink.dataset.active = true
            Bogdle.dom.interactive.gameModeFreeLink.dataset.active = false
            Bogdle.dom.interactive.difficultyContainer.classList.remove('show')
            Bogdle.dom.dailyDetails.classList.add('show')
            Bogdle.dom.interactive.btnCreateNew.disabled = true

            await Bogdle._loadExistingSolutionSet('daily', Bogdle.__getState('daily').seedWord)

            Bogdle._saveGame('daily')

            break

          case 'free':
            Bogdle._saveSetting('gameMode', 'free')
            Bogdle._clearHint()
            Bogdle.ui._enableUIButtons()

            // set dom status
            Bogdle.dom.interactive.gameModeDailyLink.dataset.active = false
            Bogdle.dom.interactive.gameModeFreeLink.dataset.active = true
            Bogdle.dom.interactive.difficultyContainer.classList.add('show')
            Bogdle.dom.dailyDetails.classList.remove('show')
            Bogdle.dom.interactive.btnCreateNew.disabled = false

            await Bogdle._loadExistingSolutionSet('free', Bogdle.__getState('free').seedWord)

            Bogdle._saveGame('free')

            break
        }
      }

      break

    case 'difficulty':
      const oldDiff = Bogdle.__getState('free').difficulty
      const newDiff = value

      console.log(oldDiff, newDiff)

      // don't prompt unless new difficulty
      if (newDiff != oldDiff) {
        // make sure user wants to change difficulty, as it loses all progress
        const mySubConfirm = new Modal(
          'confirm',
          'Change difficulty?',
          'Changing the difficulty will start a new puzzle, and the current one will be lost. Are you sure you want to do this?',
          'Yes, change difficulty',
          'No, never mind'
        )

        try {
          // wait for modal confirmation
          const confirmed = await mySubConfirm.question()

          // if confirmed, set new difficulty and reset game
          if (confirmed) {
            // set internal code model
            Bogdle.__setState('difficulty', newDiff, 'free')
            Bogdle._saveGame('free', '_changeSetting')

            // set dom status
            const oldDiffId = `diff-${oldDiff}`
            const newDiffId = `diff-${newDiff}`

            console.log(oldDiffId, newDiffId)

            document.getElementById(oldDiffId).dataset.active = false
            document.getElementById(newDiffId).dataset.active = true

            Bogdle._clearHint()

            // start new game with newDiff (but using current seedWord)
            await Bogdle._createNewSolutionSet('free', Bogdle.__getConfig('free').seedWord)
          }

          Bogdle.ui._removeModalVestige()
        } catch (err) {
          console.error('difficulty change failed', err)
        }
      }

      break

    case 'clearWord':
      var st = document.getElementById('button-setting-clear-word').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-clear-word').dataset.status = 'true'

        Bogdle._saveSetting('clearWord', true)
      } else {
        document.getElementById('button-setting-clear-word').dataset.status = 'false'

        Bogdle._saveSetting('clearWord', false)
      }

      Bogdle._saveGame('settings', '_changeSetting')

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

      Bogdle._saveGame('settings', '_changeSetting')

      break

    case 'noisy':
      var st = document.getElementById('button-setting-noisy').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-noisy').dataset.status = 'true'

        await Bogdle._initAudio()

        Bogdle._saveSetting('noisy', true)
      } else {
        document.getElementById('button-setting-noisy').dataset.status = 'false'

        await deleteOldCaches()

        Bogdle._saveSetting('noisy', false)
      }

      Bogdle._saveGame('settings', '_changeSetting')

      break
  }
}
// save a setting (gear icon) to localStorage
Bogdle._saveSetting = function (setting, value) {
  const settings = JSON.parse(localStorage.getItem(BOGDLE_SETTINGS_LS_KEY))

  if (settings) {
    // set internal code model
    Bogdle.settings[setting] = value

    // set temp obj that will go to LS
    settings[setting] = value

    // save all settings to LS
    localStorage.setItem(BOGDLE_SETTINGS_LS_KEY, JSON.stringify(settings))

    // Bogdle._logStatus(`[SAVED] setting(${setting}, ${value})`)
  } else {
    console.error('could not parse local storage key', BOGDLE_SETTINGS_LS_KEY)
  }
}
