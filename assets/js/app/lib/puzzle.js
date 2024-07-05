class Puzzle {
  trie = {}

  constructor(word, dict, diff, type) {
    this.word = word
    this.dictionary = dict
    this.difficulty = diff
    this.type = type
    this.solution = EMPTY_ARR_SET_9
  }

  createSolution = async () => {
    let validWords = []

    try {
      const response = await fetch(this.dictionary)
      const jsonWords = await response.json()
      let words = []

      switch (this.#getMaxWordLength()) {
        case 5:
          this.solution = EMPTY_ARR_SET_5
          break
        case 7:
          this.solution = EMPTY_ARR_SET_7
          break
        case 9:
        default:
          this.solution = EMPTY_ARR_SET_9
          break
      }

      // load dictionary into array
      Object.keys(jsonWords).forEach(key => {
        jsonWords[key].forEach(word => {
          words.push(word)
        })
      })

      let cur = ''
      //for word in map(lambda w: w.strip(), words): // py
      Array.from(words.map(w => w.trim())).forEach(word => {
        cur = this.trie

        Array.from(word).forEach(letter => {
          // cur = cur.setdefault(l, {}) // py
          cur = this.#setDefault(cur, letter, {})
        })

        // defined if node indicates a complete word
        cur['word'] = true
      })

      // return valid words found in seed word
      switch (this.type) {
        case 'boggle':
          const wordGrid = this.#createWordGrid(this.word)
          console.log('wordGrid', wordGrid)

          validWords = this.#gatherBoggleWords(wordGrid)
            .filter((value, index, self) => self.indexOf(value) === index)
        case 'findle':
        default:
          validWords = this.#gatherFindleWords(this.word)
            .filter((value, index, self) => self.indexOf(value) === index)
      }

      console.log(`createSolution(${this.type}) validWords`, validWords)

      // create solution set from valid words
      this.#setSolution(validWords)
    } catch (err) {
      console.error(`New Puzzle(${this.type}) could not be created`, err)

      if (this.type == 'boggle') {
        console.log('Boggle type Puzzles still WIP, returning Findle type instead')

        validWords = this.#gatherFindleWords(this.word)
          .filter((value, index, self) => self.indexOf(value) === index)

        console.log(`createSolution('findle') validWords`, validWords)
      }
    }
  }

  #gatherFindleWords = (word, trie = this.trie, cur = '', words = []) => {
    let wordArrEntries = word.split('').entries()

    // for i, letter in enumerate(word): // py
    for (let [i, letter] of wordArrEntries) {
      if (trie[letter]) {
        // if 'word' in trie[letter]: // py
        if (trie[letter]['word']) {
          if (!words.includes(cur + letter)) {
            words.push(cur + letter)
          }
        }

        this.#gatherFindleWords(
          word.slice(0, i) + word.slice(i + 1),
          trie[letter],
          cur + letter,
          words
        )
      }
    }

    return words
  }

  #gatherBoggleWords = (wordGrid, trie = this.trie, cur = '', words = []) => {
    let wordArrEntries = wordGrid.split('').entries()

    for (let [i, letter] of wordArrEntries) {
      if (trie[letter]) {
        if (trie[letter]['word']) {
          words.push(cur + letter)
        }

        this.#gatherBoggleWords(
          word.slice(0, i) + word.slice(i + 1),
          trie[letter],
          cur + letter,
          words
        )
      }

      console.log('words', words)
    }

    return words
  }

  #createWordGrid = (word) => {
    const letters = word.split('')
    console.log('letters', letters)
    const myrng = new Math.seedrandom(word);

    let j, x, index
    for (index = letters.length - 1; index > 0; index--) {
      j = Math.floor(myrng() * (index + 1))
      x = letters[index]
      letters[index] = letters[j]
      letters[j] = x
    }

    return {
      0: [letters[0], letters[1], letters[2]],
      1: [letters[3], letters[4], letters[5]],
      2: [letters[6], letters[7], letters[8]],
    }
  }

  #setSolution = (set) => {
    const categories = Array.from({length: this.#getMaxWordLength() - 3}, (x, i) => (i + 4).toString())

    // zero them all out because setting it to the EMPTY_ARR_SET_9 does not work :'(
    categories.forEach(category => {
      this.solution[category] = []
    })

    // add new solution words
    set.forEach(word => {
      this.solution[word.length].push(word)
    })

    // make sure seedWord is in there
    // this.solution[this.#getMaxWordLength()].toString()].push(this.word)
  }

  #setDefault = (obj, prop, deflt) => {
    return obj.hasOwnProperty(prop) ? obj[prop] : (obj[prop] = deflt)
  }

  #getMaxWordLength = () => {
    return this.difficulty ?
      BOGDLE_DIFF_TO_LENGTH[this.difficulty] :
      9
  }
}
