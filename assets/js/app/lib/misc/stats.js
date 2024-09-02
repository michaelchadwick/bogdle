/* lib/localStorage */
/* function for modal win/stats */
/* global Bogdle */

Bogdle._getGameCount = function (mode) {
  let ls = mode == 'daily' ?
    localStorage.getItem(BOGDLE_STATE_DAILY_LS_KEY) :
    localStorage.getItem(BOGDLE_STATE_FREE_LS_KEY)

  return ls ?
    JSON.parse(ls).filter((session) => session.gameWon == true).length :
    0
}
Bogdle._getWordCount = function (mode) {
  let ls = mode == 'daily' ?
    localStorage.getItem(BOGDLE_STATE_DAILY_LS_KEY) :
    localStorage.getItem(BOGDLE_STATE_FREE_LS_KEY)

  return ls ?
    JSON.parse(ls)
      .map((k) => k.guessedWords.length)
      .reduce((acc, cur) => acc + cur) :
    0
}
Bogdle._getHintCount = function (mode) {
  let ls = mode == 'daily' ?
    localStorage.getItem(BOGDLE_STATE_DAILY_LS_KEY) :
    localStorage.getItem(BOGDLE_STATE_FREE_LS_KEY)

  return ls ?
    JSON.parse(ls)
      .map((k) => k.hintsUsed)
      .reduce((acc, cur) => acc + cur) :
    0
}
