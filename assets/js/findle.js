const MAX_WORD_LENGTH = '9'
const ALL_OR_SOME = 'all'
const DICTIONARY_FILE = `./assets/json/words_3-${MAX_WORD_LENGTH}_${ALL_OR_SOME}.json`
// const DICTIONARY_FILE = "./assets/text/words_3_a-c.txt"

class Findle {
  solution = { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [] }
  word = ''
  trie = {}

  constructor(w) {
    this.word = w
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
    // random starter word
    // let starterIdx = Math.floor(Math.random() * dictionary[MAX_LENGTH].length)
    // this.word = dictionary[MAX_LENGTH][starterIdx]

    try {
      const response = await fetch(DICTIONARY_FILE)
      const jsonWords = await response.json()
      var words = []

      Object.keys(jsonWords).forEach(key => {
        jsonWords[key].forEach(word => {
          words.push(word)
        })
      })

      // python to js
      var cur = ''
      //for word in map(lambda w: w.strip(), words): // py
      Array.from(words.map(w => w.trim())).forEach(word_1 => {
        cur = this.trie

        Array.from(word_1).forEach(letter => {
          // cur = cur.setdefault(l, {}) // py
          cur = this.setDefault(cur, letter, {})
        })

        // defined if this node indicates a complete word
        cur['word'] = true
      })

      this.setSolution(this.findWords(this.word))

      // console.log(`The following 3- to ${MAX_WORD_LENGTH}-letter words exist in '${this.word.toUpperCase()}':`, this.solution)
    } catch (err) {
      console.error('New Findle could not be created', err)
    }
  }

  setSolution = (solution) => {
    solution.forEach(word => {
      this.solution[word.length].push(word)
    })
  }
}

async function createFindle() {
  let dictionary = [
    'ANT', 'CAT', 'DOG', 'EAT', 'END', 'FAN', 'HOT', 'MAN', 'MAT', 'RAM', 'RAT', 'SEA',
    'CASE', 'CATS', 'DOGS', 'ELMS', 'LATE', 'MART', 'PUPS', 'RAMS', 'SEAS', 'TRAM',
    'CASES', 'CATCH', 'FLICK', 'PRUNE', 'SANDY',
    'CRYSTAL', 'FLICKS', 'MANGOS', 'PEANUT',
    'DOBERMAN', 'FLICKERS',
    'AARDVARK', 'CRYSTALS', 'DOGHOUSE', 'HOTHOUSE', 'SUITCASE',
    'AARDVARKS', 'CATAMARAN', 'ENDEAVORS', 'POSTULATE'
  ]
  let word = 'catamaran'

  // create new empty Findle instance
  let findleInstance = new Findle(word)

  // console.log('init solution', findleInstance.solution)

  // create a new solution to return
  await findleInstance.createSolution()
  // console.log('new solution', findleInstance.solution)
  return findleInstance.solution
}
