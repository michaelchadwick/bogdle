class Findle {
  trie = {}
  solution = EMPTY_ARR_SET
  word = ''
  dictionary = {}

  constructor(w, d) {
    this.word = w
    this.solution = EMPTY_ARR_SET
    this.dictionary = d
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
      var words = []

      this.solution = EMPTY_ARR_SET

      //console.log('words', words)
      //console.log('this.solution', this.solution)

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

      // find all valid, unique words found in start word
      var validWords = this.findWords(this.word)
        .filter((value, index, self) => self.indexOf(value) === index)

      console.log('validWords 9', validWords.filter(w => w.length == MAX_WORD_LENGTH))

      // create solution set from valid words
      this.setSolution(validWords)

      // console.log(`The following 3- to ${MAX_WORD_LENGTH}-letter words exist in '${this.word.toUpperCase()}':`, validWords.length, this.solution)
    } catch (err) {
      console.error('New Findle could not be created', err)
    }
  }

  setSolution = (set) => {
    // get a range of object keys from 3...MAX_WORD_LENGTH
    var categories = Array.from({length: MAX_WORD_LENGTH - 2}, (x, i) => (i + 3).toString());

    // console.log('categories', categories)

    // zero them all out because setting it to the EMPTY_ARR_SET does not work :'(
    categories.forEach(category => {
      this.solution[category] = []
    })
    // add new solution words
    set.forEach(word => {
      this.solution[word.length].push(word)
    })
    // make sure startWord is in there
    this.solution[MAX_WORD_LENGTH.toString()].push(this.word)
  }
}

async function createFindle(word, dictionary) {
  // console.log(`creating new Findle for '${word.toUpperCase()}'`)

  // create new empty Findle instance
  var findleInstance = new Findle(word, dictionary)

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
