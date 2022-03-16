this.bogdle = this.bogdle || {}
this.bogdle.selected = []
this.bogdle.solutionSet = {
  'wheatmeal': 0,
  'meal': 0,
  'mate': 0,
  'wheel': 0,
  'wet': 0,
  'mat': 0,
  'eat': 0
}

this.bogdle.guess = document.getElementById('guess')
this.bogdle.guessIsValid = false
this.bogdle.tiles = document.getElementsByClassName('tile')
this.bogdle.btnSubmit = document.getElementById('buttonSubmit')
this.bogdle.btnBackspace = document.getElementById('buttonBackspace')
this.bogdle.btnShuffle = document.getElementById('buttonShuffle')

Array.from(this.bogdle.tiles).forEach(tile => {
  tile.addEventListener('click', (t) => {
    var tileStatus = t.target.dataset.state
    
    if (tileStatus == 'tbd') {
      // change tile status
      t.target.dataset.state = 'selected'

      // push another selected tile onto selected array
      this.bogdle.selected.push(t.target.dataset.pos)

      // add selected tile to guess
      this.bogdle.guess.innerHTML += t.target.innerHTML

      checkGuess()
    }
  })
})

this.bogdle.btnSubmit.addEventListener('click', () => {
  submitValid()
})
this.bogdle.btnBackspace.addEventListener('click', () => {
  if (this.bogdle.guess.innerHTML.length) {
    this.bogdle.guess.innerHTML = this.bogdle.guess.innerHTML.slice(0, this.bogdle.guess.innerHTML.length - 1)

    checkGuess()
  }
  if (this.bogdle.selected.length) {
    var last = this.bogdle.selected.pop()
    Array.from(this.bogdle.tiles).forEach(tile => {
      if (tile.dataset.pos == last) {
        tile.dataset.state = 'tbd'
        console.log('this.bogdle.selected', this.bogdle.selected)
      }
    })
  }
})

function checkGuess() {
  console.log('checking guess')

  // reset classes
  this.bogdle.guess.classList.remove('valid', 'first-guess', 'not-first-guess')

  // player entered valid word length
  if (this.bogdle.guess.innerHTML.length > 2) {
    console.log('guess length is valid')

    var key = this.bogdle.guess.innerHTML

    // player guessed a valid word
    if (key in this.bogdle.solutionSet) {
      this.bogdle.guessIsValid = true
      this.bogdle.guess.classList.toggle('valid')
      this.bogdle.btnSubmit.removeAttribute('disabled')

      // and it's the first time
      if (!this.bogdle.solutionSet[key]) {
        this.bogdle.guess.classList.add('first-guess')
      } else {
        this.bogdle.guess.classList.add('not-first-guess')
        disableSubmit()
      }
    } else { // player guessed an invalid word (not on list)
      this.bogdle.guessIsValid = false
      
      disableSubmit()
    }
  } else { // player guessed an invalid word (not long enough)
    console.log('guess length is invalid')

    this.bogdle.guessIsValid = false
    disableSubmit()
  }
}

function submitValid() {
  if (this.bogdle.guessIsValid && !this.bogdle.solutionSet[key]) {
    var key = this.bogdle.guess.innerHTML
    console.log('yay for submit', key)
    this.bogdle.solutionSet[key] = 1
    console.log('key has been marked', this.bogdle.solutionSet)
    this.bogdle.guess.innerHTML = ''
    this.bogdle.guess.classList.remove('valid')

    resetTiles()
  }
}

function disableSubmit() {
  if (!this.bogdle.btnSubmit.hasAttribute('disabled')) {
    this.bogdle.btnSubmit.setAttribute('disabled', '')
  }
}

function resetTiles() {
  Array.from(this.bogdle.tiles).forEach(tile => {
    tile.dataset.state = 'tbd'
  })
  disableSubmit()
}