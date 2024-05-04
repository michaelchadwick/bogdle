/* debug */
/* debug functions */
/* global Bogdle */

// add debug stuff if local
Bogdle._initDebug = function () {
  // if debug buttons are in template
  if (Bogdle.dom.interactive.debug.all) {
    // show debug buttons
    Bogdle.dom.interactive.debug.all.style.display = "flex";
    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll("button.icon").forEach((btn) => {
      btn.style.fontSize = "16px";
    });
  }

  var qd = {};
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
      });

  if (qd.debugCSS && qd.debugCSS == 1) {
    var debugStyles = document.createElement("link");
    debugStyles.rel = "stylesheet";
    debugStyles.href = "./assets/css/debug.css";
    document.head.appendChild(debugStyles);
  }
};

// debug: beat game to check win state
Bogdle._winGameHax = function(state = null) {
  const solutionSet = Bogdle.config[Bogdle.__getGameMode()].solutionSet
  const solutionSetSize = Bogdle.__getSolutionSize()

  modalOpen('win-game-hax')

  if (state == 'almost') {
    console.log('HAX! Setting game to one word left...')

    let count = 0

    // set to winning, but stop one short
    Object.keys(solutionSet).forEach(category => {
      if (count == solutionSetSize - 1) return

      Object.keys(solutionSet[category]).forEach(word => {
        if (solutionSet[category][word] == 0) {
          Bogdle.config[Bogdle.__getGameMode()].solutionSet[category][word] = 1
          Bogdle.state[Bogdle.__getGameMode()].guessedWords.push(word)
          Bogdle.state[Bogdle.__getGameMode()].statistics.wordsFound += 1
        }

        count += 1

        if (count == solutionSetSize - 1) return
      })
    })

    Bogdle._setScore(count)

    Bogdle.state[Bogdle.__getGameMode()].lastPlayedTime = new Date().getTime()

    Bogdle._saveGame()
  } else {
    console.log('HAX! Winning game immediately...')

    // set to winning
    Object.keys(solutionSet).forEach(category => {
      Object.keys(solutionSet[category]).forEach(word => {
        if (solutionSet[category][word] == 0) {
          Bogdle.config[Bogdle.__getGameMode()].solutionSet[category][word] = 1
          Bogdle.state[Bogdle.__getGameMode()].guessedWords.push(word)
          Bogdle.state[Bogdle.__getGameMode()].statistics.wordsFound += 1
        }
      })
    })

    Bogdle._setScore(Bogdle.__getSolutionSize())

    Bogdle._saveGame()
  }

  Bogdle._checkWinState()
}