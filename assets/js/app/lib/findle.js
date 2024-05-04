class Findle {
  trie = {}

  constructor(w, dict, diff) {
    this.word = w
    this.dictionary = dict
    this.difficulty = diff
    this.solution = EMPTY_ARR_SET
  }

  findWords = (word, trie = this.trie, cur = '', words = []) => {
    let wordArrEntries = word.split('').entries()

    // for i, letter in enumerate(word): // py
    for (let [i, letter] of wordArrEntries) {
      if (trie[letter]) {
        // if 'word' in trie[letter]: // py
        if (trie[letter]['word']) {
          words.push(cur + letter)
        }

        this.findWords(
          word.slice(0, i) + word.slice(i + 1),
          trie[letter],
          cur + letter,
          words
        )
      }
    }

    return words
  }

  setDefault = (obj, prop, deflt) => {
    return obj.hasOwnProperty(prop) ? obj[prop] : (obj[prop] = deflt);
  }

  createSolution = async () => {
    try {
      const response = await fetch(this.dictionary)
      const jsonWords = await response.json()
      let words = []

      console.log('Findle createSolution', this.getMaxWordLength())

      switch (this.getMaxWordLength()) {
        case 5:
          this.solution = EMPTY_ARR_SET_5;
          break;
        case 7:
          this.solution = EMPTY_ARR_SET_7;
          break;
        case 9:
        default:
          this.solution = EMPTY_ARR_SET;
          break;
      }

      // load dictionary into array
      Object.keys(jsonWords).forEach(key => {
        jsonWords[key].forEach(word => {
          words.push(word)
        })
      })

      var cur = ''
      //for word in map(lambda w: w.strip(), words): // py
      Array.from(words.map(w => w.trim())).forEach(word => {
        cur = this.trie

        Array.from(word).forEach(letter => {
          // cur = cur.setdefault(l, {}) // py
          cur = this.setDefault(cur, letter, {})
        })

        // defined if this node indicates a complete word
        cur['word'] = true
      })

      // find all valid, unique words found in seed word
      var validWords = this.findWords(this.word)
        .filter((value, index, self) => self.indexOf(value) === index)

      // create solution set from valid words
      this.setSolution(validWords)
    } catch (err) {
      console.error('New Findle could not be created', err)
    }
  }

  setSolution = (set) => {
    var categories = Array.from({length: this.getMaxWordLength() - 3}, (x, i) => (i + 4).toString());

    console.log('Findle categories', categories)

    // zero them all out because setting it to the EMPTY_ARR_SET does not work :'(
    categories.forEach(category => {
      this.solution[category] = []
    })

    // add new solution words
    set.forEach(word => {
      this.solution[word.length].push(word)
    })

    // make sure seedWord is in there
    // this.solution[this.getMaxWordLength()].toString()].push(this.word)
  }

  getMaxWordLength = () => {
    if (this.difficulty) {
      return BOGDLE_DIFF_TO_LENGTH[this.difficulty]
    } else {
      return 9
    }
  }
}
