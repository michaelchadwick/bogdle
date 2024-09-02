/* lib/helpers */
/* misc global functions */
/* global Bogdle */

// timestamp -> display date
Bogdle.__getFormattedDate = function (date) {
  let formatted_date = ''

  formatted_date += `${date.getFullYear()}/`
  formatted_date += `${(date.getMonth() + 1).toString().padStart(2, '0')}/` // months are 0-indexed!
  formatted_date += `${date.getDate().toString().padStart(2, '0')} `
  formatted_date += `${date.getHours().toString().padStart(2, '0')}:`
  formatted_date += `${date.getMinutes().toString().padStart(2, '0')}:`
  formatted_date += `${date.getSeconds().toString().padStart(2, '0')}`

  return formatted_date
}

// get displayable string for today's date
Bogdle.__getTodaysDate = function () {
  const d = new Date(Date.now())
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return `${days[d.getDay()]}, ${
    months[d.getMonth()]
  } ${d.getDate()}, ${d.getFullYear()}`
}

// helper method to get game difficulty as a max letter length
Bogdle.__getMaxWordLength = function () {
  if (Bogdle.__getGameMode() == 'daily') {
    return 9
  }

  let diff = Bogdle.__getState().difficulty

  if (!diff) {
    diff = 'normal'
  }

  return BOGDLE_DIFF_TO_LENGTH[diff]
}

// return Bogdle.__getConfig().solutionSet size
Bogdle.__getSolutionSize = function () {
  let categorySize = 0
  let solutionSize = 0

  const solutionSet = Bogdle.__getConfig().solutionSet

  Object.keys(solutionSet).forEach((category) => {
    if (parseInt(category) <= Bogdle.__getMaxWordLength()) {
      categorySize = Object.keys(solutionSet[category]).length
      solutionSize += categorySize
    }
  })

  return solutionSize
}

// return Bogdle.__getState().hintsUsed count
Bogdle.__getHintsUsed = function () {
  return Bogdle.__getState().hintsUsed
}

Bogdle.__updateDailyDetails = function (index) {
  Bogdle.dailyNumber = parseInt(index) + 1
  Bogdle.dom.dailyDetails.querySelector('.index').innerHTML = (
    parseInt(index) + 1
  ).toString()
  Bogdle.dom.dailyDetails.querySelector('.day').innerHTML =
    Bogdle.__getTodaysDate()
}

Bogdle.__resetTilesDuration = function () {
  Array.from(Bogdle.dom.interactive.tiles).forEach(
    (tile) => tile.style.setProperty('--animate-duration', '75ms'),
    0
  )
}

Bogdle.__getGameMode = function () {
  return Bogdle.settings.gameMode || 'daily'
}

Bogdle.__getConfig = function (mode = Bogdle.__getGameMode()) {
  return Bogdle.config[mode] || undefined
}
Bogdle.__setConfig = function (key, val, mode = Bogdle.__getGameMode()) {
  Bogdle.config[mode][key] = val
}
Bogdle.__getState = function (mode = Bogdle.__getGameMode()) {
  const rootState = Bogdle.state[mode]

  if (rootState) {
    const seshId = Bogdle.__getSessionIndex()
    const state = rootState[seshId]

    return state || undefined
  } else {
    return undefined
  }
}
Bogdle.__setState = function (
  key,
  val,
  mode = Bogdle.__getGameMode(),
  index = Bogdle.__getSessionIndex()
) {
  Bogdle.state[mode][index][key] = val
}
Bogdle.__getStateObj = function (mode = Bogdle.__getGameMode()) {
  const rootState = Bogdle.state[mode]

  return rootState || undefined
}
Bogdle.__getSessionIndex = function (mode = Bogdle.__getGameMode()) {
  const rootState = Bogdle.state[mode]

  return rootState ? rootState.length - 1 : 0
}

// load random seed word for solutionSet
Bogdle.__getNewSeedWord = async function () {
  const seedWordsFile = Bogdle.__getConfig().seedWordsFile
  const response = await fetch(seedWordsFile)
  const responseJson = await response.json()

  // random max-length word
  let possibles = responseJson['9']
  let possibleIdx = Math.floor(Math.random() * possibles.length)

  this.seedWord = possibles[possibleIdx]

  return this.seedWord
}

// get list of other NebyooApps from Dave
Bogdle._getNebyooApps = async function () {
  const response = await fetch(NEBYOOAPPS_SOURCE_URL)
  const json = await response.json()
  const apps = json.body
  const appList = document.querySelector('.nav-list')

  Object.values(apps).forEach((app) => {
    const appLink = document.createElement('a')
    appLink.href = app.url
    appLink.innerText = app.title
    appLink.target = '_blank'
    appList.appendChild(appLink)
  })
}
