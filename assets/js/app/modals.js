/* various modal configs that get called during gameplay */
/* global Deckdle */
/* eslint-disable no-undef */

Bogdle.modalOpen = async function (type) {
  let modalText

  switch (type) {
    case 'start':
    case 'help':
      if (Bogdle.myModal) {
        Bogdle.myModal._destroyModal()
      }

      modalText = `
        <p>Find all the words in the jumble of letters! Select letters in any order and then hit <button class="help"><i class="fa-solid fa-check"></i></button>. Use <button class="help wide">HINT?</button> for help if you're stuck ('/' on keyboard to cycle).</p>

        <div class="flex">
          <div>
            <h4>Daily</h4>
            <p>Words are 4 to 8 letters, except for one 9-letter pangram. Come back every day (at 12 am PST) for a new one!</p>
          </div>

          <div>
            <h4>Free</h4>
            <p>Words are <em>at least</em> 4 letters, w/ max length equal to difficulty (EASY: 5, MEDIUM: 7, NORMAL: 9). Play endlessly!
          </div>
        </div>

        <ul class="help">
          <li><span class="invalid">WORD</span> - invalid word</li>
          <li><span class="valid">WORD</span> - valid, submitted word</li>
          <li><span class="valid first-guess">WORD</span> - valid, unsubmitted word</li>
        </ul>

        <ul class="help">
          <li><button class="help"><i class="fa-solid fa-check"></i></button> Submit word (Enter/Return)</li>
          <li><button class="help"><i class="fa-solid fa-backspace"></i></button> Delete last letter in guess (Back/Del)</li>
          <li><button class="help"><i class="fa-solid fa-xmark"></i></button> Clear entire guess</li>
          <li><button class="help"><i class="fa-solid fa-shuffle"></i></button> Shuffle the tiles (Space)</li>
          <li><button class="help"><i class="fa-solid fa-list-check"></i></button> Show current progress</li>
          <li><button class="help"><i class="fa-solid fa-book"></i></button> Lookup valid word in dictionary</li>
          <li><button class="help"><i class="fa-solid fa-circle-plus"></i></button> Create new puzzle (Free mode)</li>
        </ul>

        <hr />

        <p><strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>. <strong>Sound</strong>: Fliss.</p>
      `

      Bogdle.myModal = new Modal('perm', 'How to Play Bogdle', modalText, null, null)

      if (!localStorage.getItem(BOGDLE_SETTINGS_LS_KEY)) {
        localStorage.setItem(BOGDLE_SETTINGS_LS_KEY, JSON.stringify(BOGDLE_DEFAULTS.settings))
      }

      Bogdle._saveSetting('firstTime', false)

      break

    case 'dictionary':
      const word = Bogdle.dom.guess.innerHTML

      Bogdle.myModal = new Modal(
        'perm',
        'Dictionary (via Free Dictionary API)',
        'loading definition...',
        null,
        null,
        false
      )

      const modalDialogText = document.querySelector('.modal-dialog .modal-text')

      try {
        const response = await fetch(`${BOGDLE_DEFINE_LOOKUP_URL}/${word}`)
        const responseJson = await response.json()

        // found word
        if (responseJson[0]) {
          const entry = responseJson[0]

          modalText = `
            <div class="dictionary">
              <strong>${entry.word}</strong> ${entry.phonetic}
              <hr />
              <em>${entry.meanings[0].partOfSpeech}</em>: ${entry.meanings[0].definitions[0].definition}
            </div>
          `
        } else {
          modalText = `
            <div class="dictionary">
              <strong>${word}</strong> not found!
            </div>
          `
        }

        modalDialogText.innerHTML = modalText
      } catch (e) {
        modalDialogText.innerHTML = 'Error: Free Dictionary could not be contacted.'

        console.error('could not lookup word', e)
      }
      break

    case 'stats':
    case 'win':
      if (Bogdle.myModal) {
        Bogdle.myModal._destroyModal()
      }

      modalText = `
        <div class="container">

          <div class="statistic-header">Daily</div>
          <div class="statistic-subheader">
            (<small>New puzzle available at 12am PST</small>)
          </div>

          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getGameCount('daily')}</div>
              <div class="statistic-label">Game(s) Finished</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getWordCount('daily')}</div>
              <div class="statistic-label">Word(s) Found</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getHintCount('daily')}</div>
              <div class="statistic-label">Hints(s) Used</div>
            </div>
          </div>
        `

      if (Bogdle.__getState('daily').pangramFound) {
        modalText += `
            <div class="statistic-additional">
              <div class="flex">
                <span>Today's Pangram Found!</span>
                <span>
                  <button class="share tiny" onclick="Bogdle._shareResults('pangram')">Share <i class="fa-solid fa-share-nodes"></i></button>
                </span>
              </div>
            </div>

            <p>&nbsp</p>
          `
      }

      modalText += `
          <div class="statistic-header">Free Play</div>
          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getGameCount('free')}</div>
              <div class="statistic-label">Game(s) Finished</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getWordCount('free')}</div>
              <div class="statistic-label">Word(s) Found</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Bogdle._getHintCount('free')}</div>
              <div class="statistic-label">Hint(s) Used</div>
            </div>
          </div>
      `

      if (Bogdle.__getState().gameState == 'GAME_OVER') {
        modalText += `
          <div class="share">
            <button class="share" onclick="Bogdle._shareResults()">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>
        `
      }

      modalText += `
        </div>
      `

      Bogdle.myModal = new Modal('perm', 'Statistics', modalText, null, null, false)

      break

    case 'settings':
      if (Bogdle.myModal) {
        Bogdle.myModal._destroyModal()
      }

      modalText = `
        <div id="settings">
          <!-- clear word -->
          <div class="setting-row">
            <div class="text">
              <div class="title">Clear Word</div>
              <div class="description">Clear word on valid submission</div>
            </div>
            <div class="control">
              <div class="container">
                <div id="button-setting-clear-word"
                  data-status=""
                  class="switch"
                  onclick="Bogdle._changeSetting('clearWord')"
                >
                  <span class="knob"></span>
                </div>
              </div>
            </div>
          </div>
          <!-- dark mode -->
          <div class="setting-row">
            <div class="text">
              <div class="title">Dark Mode</div>
              <div class="description">Change colors to better suit low light</div>
            </div>
            <div class="control">
              <div class="container">
                <div id="button-setting-dark-mode"
                  data-status=""
                  class="switch"
                  onclick="Bogdle._changeSetting('darkMode')"
                >
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
                <div id="button-setting-noisy"
                  data-status=""
                  class="switch"
                  onclick="Bogdle._changeSetting('noisy')"
                >
                  <span class="knob"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

      Bogdle.myModal = new Modal('perm', 'Settings', modalText, null, null)

      Bogdle._loadSettings()

      break

    case 'show-progress':
      Bogdle.myModal = new Modal('perm', 'Game Progress', Bogdle._displayGameProgress(), null, null)
      break

    case 'show-solution':
      Bogdle.myModal = new Modal(
        'perm-debug',
        'Master Word List',
        Bogdle._displayGameSolution(),
        null,
        null
      )
      break
    case 'show-config':
      Bogdle.myModal = new Modal(
        'perm-debug',
        'Game Config (code model only)',
        Bogdle._displayGameConfig(),
        null,
        null
      )
      break
    case 'show-state':
      Bogdle.myModal = new Modal(
        'perm-debug',
        'Game State (load from/save to LS)',
        Bogdle._displayGameState(),
        null,
        null
      )
      break

    case 'loading':
      Bogdle.myModal = new Modal('throbber', 'Loading', 'loading...', null, null, false)
      break

    case 'invalid-length':
      Bogdle.myModal = new Modal('temp', null, 'Needs to be 4 or more characters', null, null)
      break
    case 'invalid-word':
      Bogdle.myModal = new Modal('temp', null, 'Not in word list', null, null)
      break
    case 'repeated-word':
      Bogdle.myModal = new Modal('temp', null, 'Word already found', null, null)
      break
    case 'shared': {
      const btnShare = document.querySelector('button.share')

      if (btnShare) {
        btnShare.innerHTML = `
          Copied <i class="fa-solid fa-check"></i>
        `

        setTimeout(() => {
          btnShare.innerHTML = `
            Share <i class="fa-solid fa-share-nodes"></i>
          `
        }, 1500)
      }

      Bogdle.myModal = new Modal('temp', null, 'Results copied to clipboard', null, null)
      break
    }
    case 'no-clipboard-access':
      Bogdle.myModal = new Modal(
        'temp',
        null,
        'Sorry, but access to clipboard not available',
        null,
        null
      )
      break

    case 'win-pangram':
      modalText = `
        <div class="container">

          <div class="flex">
            <p><strong>You found the 9-letter pangram</strong>!</p>
          </div>

          <div class="flex">
            <p>You <em>could</em> stop now, share your accomplishment, and go on about your day.</p>
          </div>

          <div class="share">
            <button class="share" onclick="Bogdle._shareResults('pangram')">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>

          <p>&nbsp</p>

          <div class="flex">
            <p>Or...you could find the rest of the words!</p>
          </div>
        </div>
      `

      Bogdle.myModal = new Modal('perm', 'Pangram Found!', modalText, null, null, false)
      break

    case 'win-game':
      Bogdle.myModal = new Modal('temp', null, 'Congratulations!', null, null)
      break

    case 'win-game-hax':
      Bogdle.myModal = new Modal('temp', null, 'Hacking the game, I see', null, null)
      break
  }
}
