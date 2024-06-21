/* debug */
/* debug functions */
/* global Bogdle */

// add debug stuff if local
Bogdle._initDebug = function () {
  // if debug buttons are in template
  if (Bogdle.dom.interactive.debug.all) {
    // show debug buttons
    Bogdle.dom.interactive.debug.all.style.display = "flex"
    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll("button.icon").forEach((btn) => {
      btn.style.fontSize = "16px"
    })
  }

  var qd = {}
  if (location.search)
    location.search
      .substr(1)
      .split("&")
      .forEach(function (item) {
        var s = item.split("="),
          k = s[0],
          v = s[1] && decodeURIComponent(s[1]); //  null-coalescing / short-circuit
        //(k in qd) ? qd[k].push(v) : qd[k] = [v]
        (qd[k] = qd[k] || []).push(v); // null-coalescing / short-circuit
      })

  if (qd.debugCSS && qd.debugCSS == 1) {
    var debugStyles = document.createElement("link")
    debugStyles.rel = "stylesheet"
    debugStyles.href = "./assets/css/debug.css"
    document.head.appendChild(debugStyles)
  }
}

// modal: debug: display Bogdle.config
Bogdle._displayGameConfig = function () {
  let configs = Bogdle.config

  var html = ""

  html += `<h3>GLOBAL (ENV: ${Bogdle.env})</h3>`
  html += "<h3>----------------------------</h3>"

  html += "<dl>"

  Object.keys(configs).forEach((config) => {
    html += `<h4>CONFIG: ${config}</h4>`

    Object.keys(configs[config])
      .sort()
      .forEach((key) => {
        if (
          typeof configs[config][key] == "object" &&
          !Array.isArray(configs[config][key]) &&
          configs[config][key] != null
        ) {
          html += `<dd><code>${key}: {</code><dl>`

          // skip object-within-object key
          if (key == "solutionSet") {
            html += "<dd><code>v See console.log v</code></dd>"
            html += "</dl><code>}</code></dd>"
          } else {
            Object.keys(configs[config][key]).forEach((k) => {
              var label = k
              var value = configs[config][key][k]

              if (label == "lastCompletedTime" || label == "lastPlayedTime") {
                value = Bogdle.__getFormattedDate(new Date(value))
              }

              if (Object.keys(value)) {
                // console.log('found another object', key, label, value)
              } else {
                html += `<dd><code>${label}:</code></dd><dt>${value.join(
                  ", "
                )}</dt>`
              }
            })

            html += "</dl><code>}</code></dd>"
          }
        } else {
          var label = key
          var value = configs[config][key]

          if (label == "lastCompletedTime" || label == "lastPlayedTime") {
            if (value) {
              value = Bogdle.__getFormattedDate(new Date(value))
            }
          }

          // special cases
          if (label == "hintWord") {
            html += `<dd><code>${label}:</code></dd><dt>${value ? value.toUpperCase() : value
              }</dt>`
          } else if (label == "hintObscuredWord" || label == "letters") {
            html += `<dd><code>${label}:</code></dd><dt>${value ? value.map((v) => v.toUpperCase()).join(", ") : value
              }</dt>`
          } else {
            html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
          }
        }
      })
  })

  html += "</dl>"

  return html
}
// modal: debug: display Bogdle.state
Bogdle._displayGameState = function () {
  let states = Bogdle.state

  var html = ""

  html += "<dl>"

  Object.keys(states).forEach((state) => {
    html += `<h4>STATE: ${state}</h4>`

    Object.keys(states[state]).forEach((key) => {
      if (
        typeof states[state][key] == "object" &&
        !Array.isArray(states[state][key]) &&
        states[state][key] != null
      ) {
        html += `<dd><code>${key}: {</code><dl>`

        if (key == "statistics") {
          Object.keys(states[state][key]).forEach((subkey) => {
            var label = subkey
            var value = states[state][key][subkey]

            html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
          })

          html += "</dl><code>}</code></dd>"
        } else {
          Object.keys(states[state][key]).forEach((k) => {
            var label = k
            var value = states[state][key][k]

            if (label == "lastCompletedTime" || label == "lastPlayedTime") {
              value = Bogdle.__getFormattedDate(new Date(value))
            }

            if (value) {
              const val = Array.isArray(value) ? value.join(", ") : value
              html += `<dd><code>${label}:</code></dd><dt>${val}</dt>`
            }
          })

          html += "</dl><code>}</code></dd>"
        }
      } else {
        var label = key
        var value = states[state][key]

        // special cases
        if (label == "lastCompletedTime" || label == "lastPlayedTime") {
          if (value) {
            value = Bogdle.__getFormattedDate(new Date(value))
          }
        } else if (label == "guessedWords") {
          html += `<dd><code>${label}:</code></dd><dt>`
          html += `${value ? value.map((v) => v.toUpperCase()).join(", ") : value
            }</dt>`
        } else if (label == "seedWord") {
          html += `<dd><code>${label}:</code></dd><dt>${value ? value.toUpperCase() : value
            }</dt>`
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })
  })

  html += "</dl>"

  return html
}
// modal: debug: display current gameMode solution
Bogdle._displayGameSolution = function () {
  let html = ""
  const gameMode = Bogdle.__getGameMode()

  html += `<h3>Game Mode: ${gameMode.toUpperCase()}</h3>`
  html += "<ul>"

  // check each length category (max...4, etc.)
  Object.keys(Bogdle.__getConfig('daily').solutionSet)
    .reverse()
    .forEach((key) => {
      if (key != 10) {
        if (Object.keys(Bogdle.__getConfig(gameMode).solutionSet).includes(key)) {
          var solutionWords = []

          // create sorted array of each length category's words
          var sortedArr = Array.from(
            Object.keys(Bogdle.__getConfig(gameMode).solutionSet[key])
          ).sort()

          html += `<li><span class="solution-category">${key}-LETTER</span> (${sortedArr.length})<ul><li>`

          // go through each word in each category
          sortedArr.forEach((word) => {
            // mark guessed words
            if (Bogdle.__getState(gameMode).guessedWords.includes(word)) {
              word = `<strong>${word}</strong>`
            }

            solutionWords.push(word.toUpperCase())
          })

          // add all the words to the markup
          html += solutionWords.join(", ")
          html += `</li></ul></li>`
        }
      }
    })

  html += "</ul>"

  return html
}

// debug: beat game to check win state
Bogdle._winGameHax = async function(state = null) {
  var mySubConfirm = new Modal(
    "confirm",
    "WinGameHax?",
    "The current game will be haxed to win. Are you sure?",
    "Yes, win game via hax",
    "No, never mind"
  )

  try {
    // wait for modal confirmation
    var confirmed = await mySubConfirm.question()

    // if confirmed, hax game to win
    if (confirmed) {
      const solutionSet = Bogdle.__getConfig().solutionSet
      const solutionSetSize = Bogdle.__getSolutionSize()

      Bogdle.modalOpen('win-game-hax')

      if (state == 'almost') {
        console.log('HAX! Setting game to one word left...')

        let count = 0

        // set to winning, but stop one short
        Object.keys(solutionSet).forEach(category => {
          if (count == solutionSetSize - 1) return

          Object.keys(solutionSet[category]).forEach(word => {
            if (solutionSet[category][word] == 0) {
              Bogdle.__getConfig().solutionSet[category][word] = 1
              Bogdle.__getState().guessedWords.push(word)
            }

            count += 1

            if (count == solutionSetSize - 1) return
          })
        })

        Bogdle._setScore(count)

        Bogdle.__setState('lastPlayedTime', new Date().getTime())

        Bogdle._saveGame()
      } else {
        console.log('HAX! Winning game immediately...')

        // set to winning
        Object.keys(solutionSet).forEach(category => {
          Object.keys(solutionSet[category]).forEach(word => {
            if (solutionSet[category][word] == 0) {
              Bogdle.__getConfig().solutionSet[category][word] = 1
              Bogdle.__getState().guessedWords.push(word)
            }
          })
        })

        Bogdle._setScore(Bogdle.__getSolutionSize())

        Bogdle._saveGame()
      }

      Bogdle._checkWinState()
    }
  } catch (err) {
    console.error("win game via hax failed", err)
  }
}